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
  Code2,
  Copy,
  Check,
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
  const [chartMode, setChartMode] = useState<'line' | 'candles'>('line');
  const [showExplanation, setShowExplanation] = useState<boolean>(true);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(true);
  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [hoverBarIndex, setHoverBarIndex] = useState<number | null>(null);

  const pineScriptV5Code = `//@version=5
strategy("Asia-London-NY FVG Inversion", overlay=true, max_boxes_count=500, max_lines_count=500, initial_capital=10000)

// =========================================================
// INPUTS
// =========================================================
tz        = input.string("UTC", "Session Timezone", tooltip="Match your broker/chart timezone (e.g., UTC, America/New_York, Asia/Kolkata)")
asiaSess  = input.session("1800-0000", "Asia Session")
lonSess   = input.session("0000-0600", "London Session")
nySess    = input.session("1300-2200", "New York Session")

riskReward     = input.float(2.0, "Risk : Reward", step=0.1)
maxRiskPercent = input.float(0.95, "Max SL Distance (%)", step=0.05)
fixedRiskUSD   = input.float(100.0, "Fixed Risk per Trade ($)", step=10.0)

// London Trading Days
lonMon = input.bool(true,  "Lon Mon", group="London Trading Days", inline="ld1")
lonTue = input.bool(false, "Lon Tue", group="London Trading Days", inline="ld1")
lonWed = input.bool(true,  "Lon Wed", group="London Trading Days", inline="ld1")
lonThu = input.bool(true,  "Lon Thu", group="London Trading Days", inline="ld2")
lonFri = input.bool(false, "Lon Fri", group="London Trading Days", inline="ld2")

// New York Trading Days
nyMon = input.bool(false, "NY Mon", group="New York Trading Days", inline="nd1")
nyTue = input.bool(true,  "NY Tue", group="New York Trading Days", inline="nd1")
nyWed = input.bool(false, "NY Wed", group="New York Trading Days", inline="nd1")
nyThu = input.bool(true,  "NY Thu", group="New York Trading Days", inline="nd2")
nyFri = input.bool(false, "NY Fri", group="New York Trading Days", inline="nd2")

// Colors
asiaColor   = input.color(color.new(color.gray, 85), "Asia Box", group="Visuals")
lonColor    = input.color(color.new(color.silver, 85), "London Box", group="Visuals")
nyColor     = input.color(color.new(color.navy, 85), "NY Box", group="Visuals")
fvgActColor = input.color(color.new(color.orange, 75), "Active FVG", group="Visuals")
fvgInvColor = input.color(color.new(color.purple, 75), "Inverted FVG", group="Visuals")
slColor     = input.color(color.red, "SL Line", group="Visuals")

// =========================================================
// HELPERS
// =========================================================
inAsia   = not na(time(timeframe.period, asiaSess, tz))
inLondon = not na(time(timeframe.period, lonSess, tz))
inNy     = not na(time(timeframe.period, nySess, tz))

isLonDay() =>
    (dayofweek == dayofweek.monday and lonMon) or (dayofweek == dayofweek.tuesday and lonTue) or (dayofweek == dayofweek.wednesday and lonWed) or (dayofweek == dayofweek.thursday and lonThu) or (dayofweek == dayofweek.friday and lonFri)

isNyDay() =>
    (dayofweek == dayofweek.monday and nyMon) or (dayofweek == dayofweek.tuesday and nyTue) or (dayofweek == dayofweek.wednesday and nyWed) or (dayofweek == dayofweek.thursday and nyThu) or (dayofweek == dayofweek.friday and nyFri)

calcQty(entryPrice, slPrice) =>
    slDist = math.abs(entryPrice - slPrice)
    slDist > 0 ? fixedRiskUSD / (slDist * syminfo.pointvalue) : 0.0

// =========================================================
// STATE VARIABLES
// =========================================================
var float asiaHigh = na, var float asiaLow = na
var float lonHigh  = na, var float lonLow  = na
var float nyHigh   = na, var float nyLow   = na

var int asiaStartBar = na, var int lonStartBar = na, var int nyStartBar = na
var box asiaBox = na, var box lonBox = na, var box nyBox = na

// London Setup State
var bool  lonOrderPlaced = false
var bool  lonSweptHigh   = false, var bool lonSweptLow = false
var float lonFvgTop      = na,    var float lonFvgBot  = na
var bool  lonFvgInv      = false
var float lonSL          = na
var box   lonFvgBox      = na
var line  lonSlLine      = na

// New York Setup State
var bool  nyOrderPlaced = false
var bool  nySweptHigh   = false, var bool nySweptLow = false
var float nyFvgTop      = na,    var float nyFvgBot  = na
var bool  nyFvgInv      = false
var float nySL          = na
var box   nyFvgBox      = na
var line  nySlLine      = na

// =========================================================
// 1. ASIA SESSION (Marks Range & Resets Daily State)
// =========================================================
if inAsia
    if not inAsia[1]
        asiaStartBar := bar_index
        asiaHigh     := high
        asiaLow      := low
        asiaBox      := box.new(bar_index, asiaHigh, bar_index + 1, asiaLow, bgcolor=asiaColor, border_color=na)

        lonStartBar := na, lonHigh := na, lonLow := na
        lonOrderPlaced := false, lonSweptHigh := false, lonSweptLow := false
        lonFvgTop := na, lonFvgBot := na, lonFvgInv := false, lonSL := na
        lonFvgBox := na, lonSlLine := na

        nyStartBar := na, nyHigh := na, nyLow := na
        nyOrderPlaced := false, nySweptHigh := false, nySweptLow := false
        nyFvgTop := na, nyFvgBot := na, nyFvgInv := false, nySL := na
        nyFvgBox := na, nySlLine := na
    else
        asiaHigh := math.max(asiaHigh, high)
        asiaLow  := math.min(asiaLow, low)
        box.set_top(asiaBox, asiaHigh)
        box.set_bottom(asiaBox, asiaLow)
        box.set_right(asiaBox, bar_index + 1)

// =========================================================
// 2. LONDON SESSION (Trades Asia Range, Marks London Range)
// =========================================================
if inLondon and not na(asiaHigh)
    if not inLondon[1]
        lonStartBar := bar_index
        lonHigh     := high
        lonLow      := low
        lonBox      := box.new(bar_index, lonHigh, bar_index + 1, lonLow, bgcolor=lonColor, border_color=na)
    else
        lonHigh := math.max(lonHigh, high)
        lonLow  := math.min(lonLow, low)
        box.set_top(lonBox, lonHigh)
        box.set_bottom(lonBox, lonLow)
        box.set_right(lonBox, bar_index + 1)

    if not na(lonFvgBox)
        box.set_right(lonFvgBox, bar_index + 1)
    if not na(lonSlLine)
        line.set_x2(lonSlLine, bar_index + 1)

    if not lonOrderPlaced
        if high >= asiaHigh and not lonSweptLow
            lonSweptHigh := true
        if low <= asiaLow and not lonSweptHigh
            lonSweptLow := true

        if lonSweptHigh
            if not lonFvgInv and low > high[2] and (bar_index - 2) >= lonStartBar
                lonFvgTop := low
                lonFvgBot := high[2]
                if not na(lonFvgBox)
                    box.delete(lonFvgBox)
                lonFvgBox := box.new(bar_index - 2, lonFvgTop, bar_index + 1, lonFvgBot, bgcolor=fvgActColor, border_color=na)

            if not na(lonFvgTop) and not lonFvgInv and close < lonFvgBot
                lonFvgInv := true
                box.set_bgcolor(lonFvgBox, fvgInvColor)

                float calcSL = 0.0
                for i = 0 to 7
                    if close[i] <= lonFvgTop and close[i] >= lonFvgBot
                        continue
                    calcSL := math.max(calcSL, math.max(open[i], close[i]))
                if calcSL == 0.0
                    for i = 0 to 4
                        calcSL := math.max(calcSL, math.max(open[i], close[i]))
                lonSL := calcSL
                lonSlLine := line.new(bar_index, lonSL, bar_index + 1, lonSL, color=slColor, style=line.style_dashed, width=2)

                float entryP = lonFvgBot
                if lonSL > entryP and ((lonSL - entryP) / entryP) * 100.0 <= maxRiskPercent and isLonDay()
                    float tpP = entryP - ((lonSL - entryP) * riskReward)
                    float qty = calcQty(entryP, lonSL)
                    if qty > 0
                        strategy.entry("Lon_Short", strategy.short, qty=qty, limit=entryP)
                        strategy.exit("Lon_Short_Exit", "Lon_Short", stop=lonSL, limit=tpP)
                        lonOrderPlaced := true

        if lonSweptLow
            if not lonFvgInv and high < low[2] and (bar_index - 2) >= lonStartBar
                lonFvgBot := high
                lonFvgTop := low[2]
                if not na(lonFvgBox)
                    box.delete(lonFvgBox)
                lonFvgBox := box.new(bar_index - 2, lonFvgTop, bar_index + 1, lonFvgBot, bgcolor=fvgActColor, border_color=na)

            if not na(lonFvgBot) and not lonFvgInv and close > lonFvgTop
                lonFvgInv := true
                box.set_bgcolor(lonFvgBox, fvgInvColor)

                float calcSL = 9999999.0
                for i = 0 to 7
                    if close[i] <= lonFvgTop and close[i] >= lonFvgBot
                        continue
                    calcSL := math.min(calcSL, math.min(open[i], close[i]))
                if calcSL == 9999999.0
                    for i = 0 to 4
                        calcSL := math.min(calcSL, math.min(open[i], close[i]))
                lonSL := calcSL
                lonSlLine := line.new(bar_index, lonSL, bar_index + 1, lonSL, color=slColor, style=line.style_dashed, width=2)

                float entryP = lonFvgTop
                if lonSL < entryP and ((entryP - lonSL) / entryP) * 100.0 <= maxRiskPercent and isLonDay()
                    float tpP = entryP + ((entryP - lonSL) * riskReward)
                    float qty = calcQty(entryP, lonSL)
                    if qty > 0
                        strategy.entry("Lon_Long", strategy.long, qty=qty, limit=entryP)
                        strategy.exit("Lon_Long_Exit", "Lon_Long", stop=lonSL, limit=tpP)
                        lonOrderPlaced := true

if not inLondon and inLondon[1]
    strategy.cancel("Lon_Short")
    strategy.cancel("Lon_Long")

// =========================================================
// 3. NEW YORK SESSION (Trades London Range, Marks NY Range)
// =========================================================
if inNy and not na(lonHigh)
    if not inNy[1]
        nyStartBar := bar_index
        nyHigh     := high
        nyLow      := low
        nyBox      := box.new(bar_index, nyHigh, bar_index + 1, nyLow, bgcolor=nyColor, border_color=na)
    else
        nyHigh := math.max(nyHigh, high)
        nyLow  := math.min(nyLow, low)
        box.set_top(nyBox, nyHigh)
        box.set_bottom(nyBox, nyLow)
        box.set_right(nyBox, bar_index + 1)

    if not na(nyFvgBox)
        box.set_right(nyFvgBox, bar_index + 1)
    if not na(nySlLine)
        line.set_x2(nySlLine, bar_index + 1)

    if not nyOrderPlaced
        if high >= lonHigh and not nySweptLow
            nySweptHigh := true
        if low <= lonLow and not nySweptHigh
            nySweptLow := true

        if nySweptHigh
            if not nyFvgInv and low > high[2] and (bar_index - 2) >= nyStartBar
                nyFvgTop := low
                nyFvgBot := high[2]
                if not na(nyFvgBox)
                    box.delete(nyFvgBox)
                nyFvgBox := box.new(bar_index - 2, nyFvgTop, bar_index + 1, nyFvgBot, bgcolor=fvgActColor, border_color=na)

            if not na(nyFvgTop) and not nyFvgInv and close < nyFvgBot
                nyFvgInv := true
                box.set_bgcolor(nyFvgBox, fvgInvColor)

                float calcSL = 0.0
                for i = 0 to 7
                    if close[i] <= nyFvgTop and close[i] >= nyFvgBot
                        continue
                    calcSL := math.max(calcSL, math.max(open[i], close[i]))
                if calcSL == 0.0
                    for i = 0 to 4
                        calcSL := math.max(calcSL, math.max(open[i], close[i]))
                nySL := calcSL
                nySlLine := line.new(bar_index, nySL, bar_index + 1, nySL, color=slColor, style=line.style_dashed, width=2)

                float entryP = nyFvgBot
                if nySL > entryP and ((nySL - entryP) / entryP) * 100.0 <= maxRiskPercent and isNyDay()
                    float tpP = entryP - ((nySL - entryP) * riskReward)
                    float qty = calcQty(entryP, nySL)
                    if qty > 0
                        strategy.entry("NY_Short", strategy.short, qty=qty, limit=entryP)
                        strategy.exit("NY_Short_Exit", "NY_Short", stop=nySL, limit=tpP)
                        nyOrderPlaced := true

        if nySweptLow
            if not nyFvgInv and high < low[2] and (bar_index - 2) >= nyStartBar
                nyFvgBot := high
                nyFvgTop := low[2]
                if not na(nyFvgBox)
                    box.delete(nyFvgBox)
                nyFvgBox := box.new(bar_index - 2, nyFvgTop, bar_index + 1, nyFvgBot, bgcolor=fvgActColor, border_color=na)

            if not na(nyFvgBot) and not nyFvgInv and close > nyFvgTop
                nyFvgInv := true
                box.set_bgcolor(nyFvgBox, fvgInvColor)

                float calcSL = 9999999.0
                for i = 0 to 7
                    if close[i] <= nyFvgTop and close[i] >= nyFvgBot
                        continue
                    calcSL := math.min(calcSL, math.min(open[i], close[i]))
                if calcSL == 9999999.0
                    for i = 0 to 4
                        calcSL := math.min(calcSL, math.min(open[i], close[i]))
                nySL := calcSL
                nySlLine := line.new(bar_index, nySL, bar_index + 1, nySL, color=slColor, style=line.style_dashed, width=2)

                float entryP = nyFvgTop
                if nySL < entryP and ((entryP - nySL) / entryP) * 100.0 <= maxRiskPercent and isNyDay()
                    float tpP = entryP + ((entryP - nySL) * riskReward)
                    float qty = calcQty(entryP, nySL)
                    if qty > 0
                        strategy.entry("NY_Long", strategy.long, qty=qty, limit=entryP)
                        strategy.exit("NY_Long_Exit", "NY_Long", stop=nySL, limit=tpP)
                        nyOrderPlaced := true

if not inNy and inNy[1]
    strategy.cancel("NY_Short")
    strategy.cancel("NY_Long")
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(pineScriptV5Code);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

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

    let nyHigh = -Infinity,
      nyLow = Infinity;
    nyBars.forEach((idx) => {
      if (visibleCandles[idx].high > nyHigh) nyHigh = visibleCandles[idx].high;
      if (visibleCandles[idx].low < nyLow) nyLow = visibleCandles[idx].low;
    });

    return {
      asiaBars,
      londonBars,
      nyBars,
      asiaHigh: asiaHigh > -Infinity ? asiaHigh : null,
      asiaLow: asiaLow < Infinity ? asiaLow : null,
      lonHigh: lonHigh > -Infinity ? lonHigh : null,
      lonLow: lonLow < Infinity ? lonLow : null,
      nyHigh: nyHigh > -Infinity ? nyHigh : null,
      nyLow: nyLow < Infinity ? nyLow : null,
    };
  }, [visibleCandles]);

  // Compute smooth line path for line chart mode
  const linePath = useMemo(() => {
    if (visibleCandles.length < 2) return '';
    return visibleCandles
      .map((c, idx) => {
        const x = getX(idx);
        const y = getY(c.close);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [visibleCandles, minPrice, priceRange]);

  const lineAreaPath = useMemo(() => {
    if (visibleCandles.length < 2) return '';
    const firstX = getX(0);
    const lastX = getX(visibleCandles.length - 1);
    const bottomY = padding.top + chartH;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, visibleCandles]);

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
    <div className="w-full bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md select-none">
      {/* 1. Header with Controls (Matching Stitch Screen 8 Exactly) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm pb-space-sm border-b border-border-subtle">
        <div className="flex flex-wrap items-center gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="font-headline-sm text-headline-sm text-on-surface font-semibold" id="chart-inst-title">
              {pairName}
            </span>
            <span className="font-mono-md text-mono-md text-secondary font-bold" id="chart-inst-price">
              {candles.length > 0 ? candles[candles.length - 1].close.toFixed(symbol.includes('GC') || symbol.includes('SI') ? 2 : 4) : '—'}
            </span>
            <span className="font-mono-sm text-mono-sm text-bullish font-semibold" id="chart-inst-change">
              15m Stream
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-space-sm font-mono-sm text-mono-sm text-text-muted">
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#EEEFF0] border border-border-subtle" />
              Asia
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-forex-tint border border-secondary" />
              London
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-surface-container-low border border-border-subtle" />
              NY
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-bullish-tint border border-bullish" />
              FVG / iFVG
            </span>
          </div>
        </div>

        <div className="flex items-center gap-space-sm">
          {/* Chart View Toggle: Candlestick vs Line */}
          <div className="inline-flex items-center p-1 rounded-lg bg-surface-container-low border border-border-subtle">
            <button
              onClick={() => setChartMode('candles')}
              className={`px-space-sm py-1 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                chartMode === 'candles'
                  ? 'bg-surface-card text-on-surface shadow-xs font-semibold'
                  : 'text-text-muted hover:text-on-surface'
              }`}
              type="button"
            >
              Candlestick
            </button>
            <button
              onClick={() => setChartMode('line')}
              className={`px-space-sm py-1 rounded-md font-label-sm text-label-sm transition-all cursor-pointer ${
                chartMode === 'line'
                  ? 'bg-surface-card text-on-surface shadow-xs font-semibold'
                  : 'text-text-muted hover:text-on-surface'
              }`}
              type="button"
            >
              Line
            </button>
          </div>

          {/* Toggle Annotations */}
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`inline-flex items-center gap-1 px-space-sm py-1 rounded-lg border font-label-sm text-label-sm transition-colors cursor-pointer ${
              showAnnotations
                ? 'bg-surface-container text-on-surface border-border-subtle font-semibold'
                : 'bg-surface-card text-text-muted border-border-subtle hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">draw</span>
            <span>Drawings</span>
          </button>

          {/* Info Guide Toggle */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`inline-flex items-center gap-1 px-space-sm py-1 rounded-lg border font-label-sm text-label-sm transition-colors cursor-pointer ${
              showExplanation
                ? 'bg-bullish-tint text-bullish border-bullish font-semibold'
                : 'bg-surface-card text-text-muted border-border-subtle hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span>{showExplanation ? 'Hide Guide' : 'Explain'}</span>
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyScript}
                className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 hover:border-black rounded text-[11px] font-bold text-black shadow-xs transition-all active:scale-95"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? 'Copied Pine Script!' : 'Copy TradingView Code'}</span>
              </button>
              <span className="text-[10px] font-mono text-gray-400">PINE SCRIPT v5</span>
            </div>
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

      {/* 2b. TradingView Pine Script v5 Code Modal Viewer */}
      {showScriptModal && (
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-xs">
                Official TradingView Pine Script v5 Source Code
              </span>
            </div>
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition-all shadow-xs active:scale-95"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Copied to Clipboard!' : 'Copy Code'}</span>
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 font-sans">
            Paste this directly into your TradingView Pine Editor on any EURUSD 15-minute chart to see identical bar-by-bar executions and FVG boxes.
          </p>
          <pre className="max-h-60 overflow-y-auto p-3 bg-black/80 rounded-lg text-[10px] text-neutral-300 font-mono leading-relaxed select-text border border-neutral-800">
            {pineScriptV5Code}
          </pre>
        </div>
      )}

      {/* 3. The Live Candlestick & Drawing Overlay SVG */}
      <div className="relative w-full overflow-x-auto bg-[#FAFAFA] rounded-xl border border-gray-200 p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
        >
          <defs>
            <linearGradient id="forexPriceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 1. SESSION BACKGROUND BOXES (One Frame Context) */}
          {/* Asia Session Background Zone (18:00 - 00:00 UTC) */}
          {sessionRanges.asiaBars.length > 0 && (
            <g>
              <rect
                x={getX(sessionRanges.asiaBars[0]) - candleW}
                y={padding.top}
                width={Math.max(20, getX(sessionRanges.asiaBars[sessionRanges.asiaBars.length - 1]) - getX(sessionRanges.asiaBars[0]) + candleW * 2)}
                height={chartH}
                fill="#FEF3C7"
                fillOpacity="0.45"
                stroke="#FDE68A"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={getX(sessionRanges.asiaBars[0]) + 4}
                y={padding.top + 14}
                fontSize="9"
                fontWeight="bold"
                fill="#B45309"
                fontFamily="monospace"
              >
                ASIA RANGE BOX (18:00 - 00:00)
              </text>
            </g>
          )}

          {/* London Session Background Zone (00:00 - 06:00 UTC) */}
          {sessionRanges.londonBars.length > 0 && (
            <g>
              <rect
                x={getX(sessionRanges.londonBars[0]) - candleW}
                y={padding.top}
                width={Math.max(20, getX(sessionRanges.londonBars[sessionRanges.londonBars.length - 1]) - getX(sessionRanges.londonBars[0]) + candleW * 2)}
                height={chartH}
                fill="#DBEAFE"
                fillOpacity="0.45"
                stroke="#BFDBFE"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={getX(sessionRanges.londonBars[0]) + 4}
                y={padding.top + 14}
                fontSize="9"
                fontWeight="bold"
                fill="#1D4ED8"
                fontFamily="monospace"
              >
                LONDON SESSION BOX (00:00 - 06:00)
              </text>
            </g>
          )}

          {/* New York Session Background Zone (13:00 - 22:00 UTC) */}
          {sessionRanges.nyBars.length > 0 && (
            <g>
              <rect
                x={getX(sessionRanges.nyBars[0]) - candleW}
                y={padding.top}
                width={Math.max(20, getX(sessionRanges.nyBars[sessionRanges.nyBars.length - 1]) - getX(sessionRanges.nyBars[0]) + candleW * 2)}
                height={chartH}
                fill="#EDE9FE"
                fillOpacity="0.45"
                stroke="#DDD6FE"
                strokeWidth="1"
                rx="4"
              />
              <text
                x={getX(sessionRanges.nyBars[0]) + 4}
                y={padding.top + 14}
                fontSize="9"
                fontWeight="bold"
                fill="#6D28D9"
                fontFamily="monospace"
              >
                NEW YORK SESSION BOX (13:00 - 22:00)
              </text>
            </g>
          )}

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

          {/* 3. PRICE RENDERING: LINE CHART MODE VS CANDLESTICK MODE */}
          {chartMode === 'line' ? (
            <g>
              {/* Gradient Area Fill under Line */}
              <path
                d={lineAreaPath}
                fill="url(#forexPriceGrad)"
              />
              {/* Primary Price Trend Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Interactive Hover Nodes */}
              {visibleCandles.map((c, idx) => {
                const x = getX(idx);
                const y = getY(c.close);
                const isHovered = hoverBarIndex === idx;
                return (
                  <circle
                    key={c.time}
                    cx={x}
                    cy={y}
                    r={isHovered ? 5 : 2}
                    fill={isHovered ? '#2563EB' : '#FFFFFF'}
                    stroke="#2563EB"
                    strokeWidth={isHovered ? 2.5 : 1.2}
                    onMouseEnter={() => setHoverBarIndex(idx)}
                    onMouseLeave={() => setHoverBarIndex(null)}
                    className="cursor-crosshair"
                  />
                );
              })}
            </g>
          ) : (
            /* Candlestick Rendering */
            visibleCandles.map((c, idx) => {
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
            })
          )}

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
