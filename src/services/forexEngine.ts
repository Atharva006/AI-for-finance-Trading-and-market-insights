import { Candle, Trade, ExitReason, EquityPoint } from '../types/backtest';

export interface ForexPairInfo {
  symbol: string;         // e.g. 'EURUSD=X', 'GC=F'
  displayName: string;    // e.g. 'EUR/USD', 'GOLD (XAU/USD)'
  baseCurrency: string;   // 'EUR', 'XAU'
  quoteCurrency: string;  // 'USD'
  category: 'Forex Major' | 'Precious Metal' | 'Currency Hedge';
  pipSize: number;        // 0.0001, 0.10 for Gold, 0.01 for Silver
  standardLotUnits: number; // 100,000 units (or 100 oz for Gold, 5,000 oz for Silver)
  spreadPips: number;     // typical spread in pips/points
  description: string;
}

export const FOREX_PAIRS: Record<string, ForexPairInfo> = {
  'EURUSD=X': {
    symbol: 'EURUSD=X',
    displayName: 'EUR/USD',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
    category: 'Forex Major',
    pipSize: 0.0001,
    standardLotUnits: 100000,
    spreadPips: 0.8,
    description: 'Euro vs US Dollar - Most liquid currency pair globally.',
  },
  'GBPUSD=X': {
    symbol: 'GBPUSD=X',
    displayName: 'GBP/USD',
    baseCurrency: 'GBP',
    quoteCurrency: 'USD',
    category: 'Forex Major',
    pipSize: 0.0001,
    standardLotUnits: 100000,
    spreadPips: 1.2,
    description: 'British Pound vs US Dollar (Cable) - High volatility macro trends.',
  },
  'GC=F': {
    symbol: 'GC=F',
    displayName: 'GOLD (XAU/USD)',
    baseCurrency: 'XAU',
    quoteCurrency: 'USD',
    category: 'Precious Metal',
    pipSize: 0.10,
    standardLotUnits: 100,
    spreadPips: 0.35,
    description: 'Gold COMEX / Spot Benchmark - Global sovereign safe-haven & inflation hedge.',
  },
  'SI=F': {
    symbol: 'SI=F',
    displayName: 'SILVER (XAG/USD)',
    baseCurrency: 'XAG',
    quoteCurrency: 'USD',
    category: 'Precious Metal',
    pipSize: 0.01,
    standardLotUnits: 5000,
    spreadPips: 0.02,
    description: 'Silver COMEX / Spot Benchmark - High-beta monetary metal & industrial precious commodity.',
  },
  'USDINR=X': {
    symbol: 'USDINR=X',
    displayName: 'USD/INR',
    baseCurrency: 'USD',
    quoteCurrency: 'INR',
    category: 'Currency Hedge',
    pipSize: 0.0025,
    standardLotUnits: 1000,
    spreadPips: 0.5,
    description: 'US Dollar vs Indian Rupee - NRI Inflow & FX Hedging Pair.',
  },
};

/**
 * Parameters matching the user's Pine Script v5: "Asia-London-NY FVG Inversion"
 */
export interface SessionSweepStrategyParams {
  timezone: string; // e.g. 'UTC'
  asiaSessStartHour: number; // 18:00 UTC
  asiaSessEndHour: number;   // 00:00 UTC
  lonSessStartHour: number;  // 00:00 UTC
  lonSessEndHour: number;    // 06:00 UTC
  nySessStartHour: number;   // 13:00 UTC
  nySessEndHour: number;     // 22:00 UTC

  riskReward: number;        // default 2.0 (1:2 RR)
  maxRiskPercent: number;    // default 0.95% (Max SL Distance %)
  fixedRiskUSD: number;      // default $100.00 Fixed Risk per Trade

  // London active trading days
  lonMon: boolean; // default true
  lonTue: boolean; // default false
  lonWed: boolean; // default true
  lonThu: boolean; // default true
  lonFri: boolean; // default false

  // New York active trading days
  nyMon: boolean;  // default false
  nyTue: boolean;  // default true
  nyWed: boolean;  // default false
  nyThu: boolean;  // default true
  nyFri: boolean;  // default false
}

export const DEFAULT_SESSION_SWEEP_PARAMS: SessionSweepStrategyParams = {
  timezone: 'UTC',
  asiaSessStartHour: 18,
  asiaSessEndHour: 0,
  lonSessStartHour: 0,
  lonSessEndHour: 6,
  nySessStartHour: 13,
  nySessEndHour: 22,

  riskReward: 2.0,
  maxRiskPercent: 0.95,
  fixedRiskUSD: 100.0,

  lonMon: true,
  lonTue: false,
  lonWed: true,
  lonThu: true,
  lonFri: false,

  nyMon: false,
  nyTue: true,
  nyWed: false,
  nyThu: true,
  nyFri: false,
};

export interface ForexBacktestResult {
  symbol: string;
  pairInfo: ForexPairInfo;
  candles: Candle[];
  trades: Trade[];
  isWaitingForUserStrategy: boolean;
  strategyName: string;
  metrics: {
    totalTrades: number;
    winTrades: number;
    lossTrades: number;
    winRate: number;
    totalProfitUSD: number;
    totalProfitINR: number;
    totalReturnPct: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdownPct: number;
    maxDrawdownUSD: number;
    avgWinUSD: number;
    avgLossUSD: number;
    cagrPct: number;
    totalPipsGained: number;
  };
  equityCurve: EquityPoint[];
  equityCurveUSD: {
    time: string;
    equityUSD: number;
    drawdownPct: number;
  }[];
}

/**
 * Checks if a given timestamp falls into the Asia session (18:00 - 00:00 UTC)
 */
function isAsiaSession(date: Date, startH = 18, endH = 0): boolean {
  const h = date.getUTCHours();
  if (startH > endH) {
    // Spans overnight e.g. 18 to 24 (0)
    return h >= startH || h < endH;
  }
  return h >= startH && h < endH;
}

/**
 * Checks if a given timestamp falls into the London session (00:00 - 06:00 UTC)
 */
function isLondonSession(date: Date, startH = 0, endH = 6): boolean {
  const h = date.getUTCHours();
  return h >= startH && h < endH;
}

/**
 * Checks if a given timestamp falls into the NY session (13:00 - 22:00 UTC)
 */
function isNySession(date: Date, startH = 13, endH = 22): boolean {
  const h = date.getUTCHours();
  return h >= startH && h < endH;
}

/**
 * Translates and executes the Pine Script v5 "Asia-London-NY FVG Inversion" Strategy
 * Strictly bar-by-bar on authentic historical candles.
 */
export function runSessionSweepBacktest(
  candles: Candle[],
  pairInfo: ForexPairInfo,
  params: SessionSweepStrategyParams = DEFAULT_SESSION_SWEEP_PARAMS,
  initialCapitalUSD = 25000,
  usdInrRate = 92.67
): ForexBacktestResult {
  const activeStrategyName = `${pairInfo.displayName} · Asia-London-NY FVG Inversion (Pine Script v5)`;

  if (!candles || candles.length < 5) {
    return {
      symbol: pairInfo.symbol,
      pairInfo,
      candles: candles || [],
      trades: [],
      isWaitingForUserStrategy: false,
      strategyName: activeStrategyName,
      metrics: {
        totalTrades: 0,
        winTrades: 0,
        lossTrades: 0,
        winRate: 0,
        totalProfitUSD: 0,
        totalProfitINR: 0,
        totalReturnPct: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdownPct: 0,
        maxDrawdownUSD: 0,
        avgWinUSD: 0,
        avgLossUSD: 0,
        cagrPct: 0,
        totalPipsGained: 0,
      },
      equityCurve: [{ time: 'N/A', equity: initialCapitalUSD, benchmarkEquity: initialCapitalUSD, drawdownPct: 0 }],
      equityCurveUSD: [{ time: 'N/A', equityUSD: initialCapitalUSD, drawdownPct: 0 }],
    };
  }

  const trades: Trade[] = [];
  let currentEquityUSD = initialCapitalUSD;
  let peakEquityUSD = initialCapitalUSD;
  let maxDrawdownUSD = 0;
  let maxDrawdownPct = 0;
  let totalPips = 0;

  const equityCurveUSD: { time: string; equityUSD: number; drawdownPct: number }[] = [
    { time: candles[0].time, equityUSD: initialCapitalUSD, drawdownPct: 0 },
  ];
  const equityCurve: EquityPoint[] = [
    { time: candles[0].time, equity: initialCapitalUSD, benchmarkEquity: initialCapitalUSD, drawdownPct: 0 },
  ];

  // Strategy State tracking matching Pine Script
  let asiaHigh: number | null = null;
  let asiaLow: number | null = null;
  let lonHigh: number | null = null;
  let lonLow: number | null = null;
  let nyHigh: number | null = null;
  let nyLow: number | null = null;

  let lonOrderPlaced = false;
  let lonSweptHigh = false;
  let lonSweptLow = false;
  let lonFvgTop: number | null = null;
  let lonFvgBot: number | null = null;
  let lonFvgInv = false;
  let lonSL: number | null = null;

  let nyOrderPlaced = false;
  let nySweptHigh = false;
  let nySweptLow = false;
  let nyFvgTop: number | null = null;
  let nyFvgBot: number | null = null;
  let nyFvgInv = false;
  let nySL: number | null = null;

  // Active positions & limit orders
  let openTrade: {
    id: string;
    type: 'BUY' | 'SELL';
    entryIndex: number;
    entryTime: string;
    entryPrice: number;
    qty: number;
    stopLoss: number;
    takeProfit: number;
    session: 'London' | 'NY';
  } | null = null;

  let pendingLimitOrder: {
    type: 'BUY' | 'SELL';
    limitPrice: number;
    stopLoss: number;
    takeProfit: number;
    qty: number;
    session: 'London' | 'NY';
    placedIndex: number;
  } | null = null;

  const isLondonDay = (dayOfWeek: number) => {
    // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    if (dayOfWeek === 1) return params.lonMon;
    if (dayOfWeek === 2) return params.lonTue;
    if (dayOfWeek === 3) return params.lonWed;
    if (dayOfWeek === 4) return params.lonThu;
    if (dayOfWeek === 5) return params.lonFri;
    return false;
  };

  const isNyDay = (dayOfWeek: number) => {
    if (dayOfWeek === 1) return params.nyMon;
    if (dayOfWeek === 2) return params.nyTue;
    if (dayOfWeek === 3) return params.nyWed;
    if (dayOfWeek === 4) return params.nyThu;
    if (dayOfWeek === 5) return params.nyFri;
    return false;
  };

  for (let i = 2; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1];
    const prev2C = candles[i - 2];
    const date = new Date(c.timestamp);
    const dayOfWeek = date.getUTCDay();

    const inAsia = isAsiaSession(date, params.asiaSessStartHour, params.asiaSessEndHour);
    const inLondon = isLondonSession(date, params.lonSessStartHour, params.lonSessEndHour);
    const inNy = isNySession(date, params.nySessStartHour, params.nySessEndHour);

    const prevDate = new Date(prevC.timestamp);
    const prevInAsia = isAsiaSession(prevDate, params.asiaSessStartHour, params.asiaSessEndHour);
    const prevInLondon = isLondonSession(prevDate, params.lonSessStartHour, params.lonSessEndHour);
    const prevInNy = isNySession(prevDate, params.nySessStartHour, params.nySessEndHour);

    // 1. ASIA SESSION: Marks Range & Resets Daily State
    if (inAsia) {
      if (!prevInAsia) {
        // Asia Open: Reset London & NY state
        asiaHigh = c.high;
        asiaLow = c.low;

        lonHigh = null;
        lonLow = null;
        lonOrderPlaced = false;
        lonSweptHigh = false;
        lonSweptLow = false;
        lonFvgTop = null;
        lonFvgBot = null;
        lonFvgInv = false;
        lonSL = null;

        nyHigh = null;
        nyLow = null;
        nyOrderPlaced = false;
        nySweptHigh = false;
        nySweptLow = false;
        nyFvgTop = null;
        nyFvgBot = null;
        nyFvgInv = false;
        nySL = null;

        // Cancel unfilled orders
        pendingLimitOrder = null;
      } else {
        if (asiaHigh !== null) asiaHigh = Math.max(asiaHigh, c.high);
        if (asiaLow !== null) asiaLow = Math.min(asiaLow, c.low);
      }
    }

    // 2. LONDON SESSION: Trades Asia Range, Marks London Range
    if (inLondon && asiaHigh !== null && asiaLow !== null) {
      if (!prevInLondon) {
        lonHigh = c.high;
        lonLow = c.low;
      } else {
        if (lonHigh !== null) lonHigh = Math.max(lonHigh, c.high);
        if (lonLow !== null) lonLow = Math.min(lonLow, c.low);
      }

      if (!lonOrderPlaced) {
        // Equal high/low sweep detection
        if (c.high >= asiaHigh && !lonSweptLow) {
          lonSweptHigh = true;
        }
        if (c.low <= asiaLow && !lonSweptHigh) {
          lonSweptLow = true;
        }

        // --- LONDON SHORT SCENARIO ---
        if (lonSweptHigh) {
          // Dynamic Bullish FVG: low > high[2]
          if (!lonFvgInv && c.low > prev2C.high) {
            lonFvgTop = c.low;
            lonFvgBot = prev2C.high;
          }

          // Inversion Check: close < lonFvgBot
          if (lonFvgTop !== null && lonFvgBot !== null && !lonFvgInv && c.close < lonFvgBot) {
            lonFvgInv = true;

            // Filtered Swing Body SL (skip candles closing inside FVG)
            let calcSL = 0.0;
            for (let k = 0; k <= 7 && i - k >= 0; k++) {
              const ck = candles[i - k];
              if (ck.close <= lonFvgTop && ck.close >= lonFvgBot) continue;
              calcSL = Math.max(calcSL, Math.max(ck.open, ck.close));
            }
            if (calcSL === 0.0) {
              for (let k = 0; k <= 4 && i - k >= 0; k++) {
                const ck = candles[i - k];
                calcSL = Math.max(calcSL, Math.max(ck.open, ck.close));
              }
            }
            lonSL = calcSL;

            // Place Limit Order on FVG Edge (lonFvgBot)
            const entryP = lonFvgBot;
            if (
              lonSL > entryP &&
              ((lonSL - entryP) / entryP) * 100.0 <= params.maxRiskPercent &&
              isLondonDay(dayOfWeek)
            ) {
              const tpP = entryP - (lonSL - entryP) * params.riskReward;
              const slDist = Math.abs(entryP - lonSL);
              const qty = slDist > 0 ? params.fixedRiskUSD / slDist : 0;
              if (qty > 0) {
                pendingLimitOrder = {
                  type: 'SELL',
                  limitPrice: entryP,
                  stopLoss: lonSL,
                  takeProfit: tpP,
                  qty,
                  session: 'London',
                  placedIndex: i,
                };
                lonOrderPlaced = true;
              }
            }
          }
        }

        // --- LONDON LONG SCENARIO ---
        if (lonSweptLow) {
          // Dynamic Bearish FVG: high < low[2]
          if (!lonFvgInv && c.high < prev2C.low) {
            lonFvgBot = c.high;
            lonFvgTop = prev2C.low;
          }

          // Inversion Check: close > lonFvgTop
          if (lonFvgBot !== null && lonFvgTop !== null && !lonFvgInv && c.close > lonFvgTop) {
            lonFvgInv = true;

            let calcSL = 9999999.0;
            for (let k = 0; k <= 7 && i - k >= 0; k++) {
              const ck = candles[i - k];
              if (ck.close <= lonFvgTop && ck.close >= lonFvgBot) continue;
              calcSL = Math.min(calcSL, Math.min(ck.open, ck.close));
            }
            if (calcSL === 9999999.0) {
              for (let k = 0; k <= 4 && i - k >= 0; k++) {
                const ck = candles[i - k];
                calcSL = Math.min(calcSL, Math.min(ck.open, ck.close));
              }
            }
            lonSL = calcSL;

            const entryP = lonFvgTop;
            if (
              lonSL < entryP &&
              ((entryP - lonSL) / entryP) * 100.0 <= params.maxRiskPercent &&
              isLondonDay(dayOfWeek)
            ) {
              const tpP = entryP + (entryP - lonSL) * params.riskReward;
              const slDist = Math.abs(entryP - lonSL);
              const qty = slDist > 0 ? params.fixedRiskUSD / slDist : 0;
              if (qty > 0) {
                pendingLimitOrder = {
                  type: 'BUY',
                  limitPrice: entryP,
                  stopLoss: lonSL,
                  takeProfit: tpP,
                  qty,
                  session: 'London',
                  placedIndex: i,
                };
                lonOrderPlaced = true;
              }
            }
          }
        }
      }
    }

    // Cancel unfilled London orders when session ends
    if (!inLondon && prevInLondon) {
      if (pendingLimitOrder && pendingLimitOrder.session === 'London') {
        pendingLimitOrder = null;
      }
    }

    // 3. NEW YORK SESSION: Trades London Range, Marks NY Range
    if (inNy && lonHigh !== null && lonLow !== null) {
      if (!prevInNy) {
        nyHigh = c.high;
        nyLow = c.low;
      } else {
        if (nyHigh !== null) nyHigh = Math.max(nyHigh, c.high);
        if (nyLow !== null) nyLow = Math.min(nyLow, c.low);
      }

      if (!nyOrderPlaced) {
        if (c.high >= lonHigh && !nySweptLow) {
          nySweptHigh = true;
        }
        if (c.low <= lonLow && !nySweptHigh) {
          nySweptLow = true;
        }

        // --- NY SHORT SCENARIO ---
        if (nySweptHigh) {
          if (!nyFvgInv && c.low > prev2C.high) {
            nyFvgTop = c.low;
            nyFvgBot = prev2C.high;
          }

          if (nyFvgTop !== null && nyFvgBot !== null && !nyFvgInv && c.close < nyFvgBot) {
            nyFvgInv = true;

            let calcSL = 0.0;
            for (let k = 0; k <= 7 && i - k >= 0; k++) {
              const ck = candles[i - k];
              if (ck.close <= nyFvgTop && ck.close >= nyFvgBot) continue;
              calcSL = Math.max(calcSL, Math.max(ck.open, ck.close));
            }
            if (calcSL === 0.0) {
              for (let k = 0; k <= 4 && i - k >= 0; k++) {
                const ck = candles[i - k];
                calcSL = Math.max(calcSL, Math.max(ck.open, ck.close));
              }
            }
            nySL = calcSL;

            const entryP = nyFvgBot;
            if (
              nySL > entryP &&
              ((nySL - entryP) / entryP) * 100.0 <= params.maxRiskPercent &&
              isNyDay(dayOfWeek)
            ) {
              const tpP = entryP - (nySL - entryP) * params.riskReward;
              const slDist = Math.abs(entryP - nySL);
              const qty = slDist > 0 ? params.fixedRiskUSD / slDist : 0;
              if (qty > 0) {
                pendingLimitOrder = {
                  type: 'SELL',
                  limitPrice: entryP,
                  stopLoss: nySL,
                  takeProfit: tpP,
                  qty,
                  session: 'NY',
                  placedIndex: i,
                };
                nyOrderPlaced = true;
              }
            }
          }
        }

        // --- NY LONG SCENARIO ---
        if (nySweptLow) {
          if (!nyFvgInv && c.high < prev2C.low) {
            nyFvgBot = c.high;
            nyFvgTop = prev2C.low;
          }

          if (nyFvgBot !== null && nyFvgTop !== null && !nyFvgInv && c.close > nyFvgTop) {
            nyFvgInv = true;

            let calcSL = 9999999.0;
            for (let k = 0; k <= 7 && i - k >= 0; k++) {
              const ck = candles[i - k];
              if (ck.close <= nyFvgTop && ck.close >= nyFvgBot) continue;
              calcSL = Math.min(calcSL, Math.min(ck.open, ck.close));
            }
            if (calcSL === 9999999.0) {
              for (let k = 0; k <= 4 && i - k >= 0; k++) {
                const ck = candles[i - k];
                calcSL = Math.min(calcSL, Math.min(ck.open, ck.close));
              }
            }
            nySL = calcSL;

            const entryP = nyFvgTop;
            if (
              nySL < entryP &&
              ((entryP - nySL) / entryP) * 100.0 <= params.maxRiskPercent &&
              isNyDay(dayOfWeek)
            ) {
              const tpP = entryP + (entryP - nySL) * params.riskReward;
              const slDist = Math.abs(entryP - nySL);
              const qty = slDist > 0 ? params.fixedRiskUSD / slDist : 0;
              if (qty > 0) {
                pendingLimitOrder = {
                  type: 'BUY',
                  limitPrice: entryP,
                  stopLoss: nySL,
                  takeProfit: tpP,
                  qty,
                  session: 'NY',
                  placedIndex: i,
                };
                nyOrderPlaced = true;
              }
            }
          }
        }
      }
    }

    // Cancel unfilled NY orders when session ends
    if (!inNy && prevInNy) {
      if (pendingLimitOrder && pendingLimitOrder.session === 'NY') {
        pendingLimitOrder = null;
      }
    }

    // --- CHECK LIMIT ORDER EXECUTION ---
    if (pendingLimitOrder && !openTrade) {
      let isFilled = false;
      if (pendingLimitOrder.type === 'BUY') {
        // Limit buy is filled if price touches limitPrice
        if (c.low <= pendingLimitOrder.limitPrice) {
          isFilled = true;
        }
      } else {
        // Limit sell
        if (c.high >= pendingLimitOrder.limitPrice) {
          isFilled = true;
        }
      }

      if (isFilled) {
        openTrade = {
          id: `sweep-${trades.length + 1}`,
          type: pendingLimitOrder.type,
          entryIndex: i,
          entryTime: c.time,
          entryPrice: pendingLimitOrder.limitPrice,
          qty: pendingLimitOrder.qty,
          stopLoss: pendingLimitOrder.stopLoss,
          takeProfit: pendingLimitOrder.takeProfit,
          session: pendingLimitOrder.session,
        };
        pendingLimitOrder = null;
      }
    }

    // --- CHECK OPEN TRADE EXITS (Stop-Loss / Take-Profit) ---
    if (openTrade) {
      let exitPrice = 0;
      let exitReason: ExitReason = 'TAKE_PROFIT';
      let isClosed = false;

      if (openTrade.type === 'BUY') {
        if (c.low <= openTrade.stopLoss) {
          isClosed = true;
          exitPrice = openTrade.stopLoss;
          exitReason = 'STOP_LOSS';
        } else if (c.high >= openTrade.takeProfit) {
          isClosed = true;
          exitPrice = openTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          isClosed = true;
          exitPrice = c.close;
          exitReason = 'SESSION_CLOSE';
        }
      } else {
        // SELL
        if (c.high >= openTrade.stopLoss) {
          isClosed = true;
          exitPrice = openTrade.stopLoss;
          exitReason = 'STOP_LOSS';
        } else if (c.low <= openTrade.takeProfit) {
          isClosed = true;
          exitPrice = openTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          isClosed = true;
          exitPrice = c.close;
          exitReason = 'SESSION_CLOSE';
        }
      }

      if (isClosed) {
        const pipDiff =
          openTrade.type === 'BUY'
            ? (exitPrice - openTrade.entryPrice) / pairInfo.pipSize
            : (openTrade.entryPrice - exitPrice) / pairInfo.pipSize;

        const tradePnlUSD =
          openTrade.type === 'BUY'
            ? (exitPrice - openTrade.entryPrice) * openTrade.qty
            : (openTrade.entryPrice - exitPrice) * openTrade.qty;

        const pnlPct = (tradePnlUSD / currentEquityUSD) * 100;
        currentEquityUSD += tradePnlUSD;
        totalPips += pipDiff;

        if (currentEquityUSD > peakEquityUSD) peakEquityUSD = currentEquityUSD;
        const ddUSD = peakEquityUSD - currentEquityUSD;
        const ddPct = (ddUSD / peakEquityUSD) * 100;
        if (ddUSD > maxDrawdownUSD) maxDrawdownUSD = ddUSD;
        if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;

        trades.push({
          id: openTrade.id,
          type: openTrade.type,
          entryIndex: openTrade.entryIndex,
          entryTime: openTrade.entryTime,
          entryPrice: openTrade.entryPrice,
          exitIndex: i,
          exitTime: c.time,
          exitPrice,
          qty: openTrade.qty,
          pnl: tradePnlUSD,
          pnlPct,
          exitReason,
          stopLoss: openTrade.stopLoss,
          takeProfit: openTrade.takeProfit,
          riskDist: Math.abs(openTrade.entryPrice - openTrade.stopLoss),
        });

        openTrade = null;
      }
    }

    const ddPctCurrent = peakEquityUSD > 0 ? ((peakEquityUSD - currentEquityUSD) / peakEquityUSD) * 100 : 0;
    equityCurveUSD.push({
      time: c.time,
      equityUSD: currentEquityUSD,
      drawdownPct: ddPctCurrent,
    });
    equityCurve.push({
      time: c.time,
      equity: currentEquityUSD,
      benchmarkEquity: initialCapitalUSD,
      drawdownPct: ddPctCurrent,
    });
  }

  // Summary Metrics
  const totalTrades = trades.length;
  const winTrades = trades.filter((t) => t.pnl > 0).length;
  const lossTrades = trades.filter((t) => t.pnl < 0).length;
  const winRate = totalTrades > 0 ? (winTrades / totalTrades) * 100 : 0;
  const totalProfitUSD = currentEquityUSD - initialCapitalUSD;
  const totalProfitINR = totalProfitUSD * usdInrRate;
  const totalReturnPct = (totalProfitUSD / initialCapitalUSD) * 100;

  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 99 : 0);

  const avgWinUSD = winTrades > 0 ? grossProfit / winTrades : 0;
  const avgLossUSD = lossTrades > 0 ? grossLoss / lossTrades : 0;

  const returns = trades.map((t) => t.pnlPct);
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0;

  const years = Math.max(candles.length / (24 * 4 * 252), 0.25);
  const cagrPct = (Math.pow(Math.max(currentEquityUSD / initialCapitalUSD, 0.01), 1 / years) - 1) * 100;

  return {
    symbol: pairInfo.symbol,
    pairInfo,
    candles,
    trades,
    isWaitingForUserStrategy: false,
    strategyName: activeStrategyName,
    metrics: {
      totalTrades,
      winTrades,
      lossTrades,
      winRate: Number(winRate.toFixed(1)),
      totalProfitUSD: Number(totalProfitUSD.toFixed(2)),
      totalProfitINR: Number(totalProfitINR.toFixed(2)),
      totalReturnPct: Number(totalReturnPct.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
      sharpeRatio: Number(sharpeRatio.toFixed(2)),
      maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
      maxDrawdownUSD: Number(maxDrawdownUSD.toFixed(2)),
      avgWinUSD: Number(avgWinUSD.toFixed(2)),
      avgLossUSD: Number(avgLossUSD.toFixed(2)),
      cagrPct: Number(cagrPct.toFixed(2)),
      totalPipsGained: Number(totalPips.toFixed(1)),
    },
    equityCurve,
    equityCurveUSD,
  };
}
