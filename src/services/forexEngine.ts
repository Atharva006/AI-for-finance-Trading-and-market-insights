import { Candle, Trade, ExitReason } from '../types/backtest';

export interface ForexPairInfo {
  symbol: string;         // e.g. 'EURUSD=X'
  displayName: string;    // e.g. 'EUR/USD'
  baseCurrency: string;   // 'EUR'
  quoteCurrency: string;  // 'USD'
  pipSize: number;        // 0.0001 (or 0.01 for JPY)
  standardLotUnits: number; // 100,000 units
  spreadPips: number;     // typical spread 0.8 pips
  description: string;
}

export const FOREX_PAIRS: Record<string, ForexPairInfo> = {
  'EURUSD=X': {
    symbol: 'EURUSD=X',
    displayName: 'EUR/USD',
    baseCurrency: 'EUR',
    quoteCurrency: 'USD',
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
    pipSize: 0.0001,
    standardLotUnits: 100000,
    spreadPips: 1.2,
    description: 'British Pound vs US Dollar (Cable) - High volatility trend swings.',
  },
  'USDJPY=X': {
    symbol: 'USDJPY=X',
    displayName: 'USD/JPY',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    pipSize: 0.01,
    standardLotUnits: 100000,
    spreadPips: 1.0,
    description: 'US Dollar vs Japanese Yen - Macro carry-trade benchmark.',
  },
  'USDINR=X': {
    symbol: 'USDINR=X',
    displayName: 'USD/INR',
    baseCurrency: 'USD',
    quoteCurrency: 'INR',
    pipSize: 0.0025,
    standardLotUnits: 1000,
    spreadPips: 0.5,
    description: 'US Dollar vs Indian Rupee - NRI Remittance & Hedging pair.',
  },
};

export type ForexStrategyId =
  | 'FOREX_ASIAN_BREAKOUT'
  | 'FOREX_MACD_RSI_MOMENTUM'
  | 'FOREX_BB_MEAN_REVERSION'
  | 'FOREX_DONCHIAN_TREND';

export interface ForexStrategyDefinition {
  id: ForexStrategyId;
  name: string;
  tagline: string;
  category: 'Session Breakout' | 'Momentum Trend' | 'Volatility Bands' | 'Trend Channel';
  recommendedPairs: string[];
  description: string;
  rulesSummary: string[];
  defaultParams: ForexStrategyParams;
}

export interface ForexStrategyParams {
  strategyId: ForexStrategyId;
  lotSize: number;             // Lots (e.g. 0.1 mini lot, 1.0 standard lot)
  riskPerTradePct: number;     // e.g. 1.0%
  takeProfitPips?: number;     // Fixed or ATR pip multiple
  stopLossPips?: number;       // Stop loss in pips
  trailingStopPips?: number;   // Trailing stop distance
  
  // Strategy specific parameters:
  emaFast?: number;            // e.g. 12
  emaSlow?: number;            // e.g. 26
  rsiPeriod?: number;          // e.g. 14
  rsiOverbought?: number;      // e.g. 70
  rsiOversold?: number;        // e.g. 30
  bbLength?: number;           // e.g. 20
  bbStdDev?: number;           // e.g. 2.0
  donchianPeriod?: number;     // e.g. 20
  atrPeriod?: number;          // e.g. 14
  atrMultiplier?: number;      // e.g. 1.5
}

export const FOREX_STRATEGIES: ForexStrategyDefinition[] = [
  {
    id: 'FOREX_ASIAN_BREAKOUT',
    name: 'London/NY High-Low Breakout & ATR Expansion',
    tagline: 'Capitalize on London 08:00 GMT liquidity explosive breaks above Asian range.',
    category: 'Session Breakout',
    recommendedPairs: ['EURUSD=X', 'GBPUSD=X'],
    description:
      'Engineered specifically for EURUSD and GBPUSD. Captures directional institutional expansion when price breaches the prior consolidated range with ATR volatility surge.',
    rulesSummary: [
      'Identifies highest high & lowest low of preceding consolidation zone.',
      'Enters Long when Close closes above upper range + 0.5x ATR buffer.',
      'Enters Short when Close closes below lower range - 0.5x ATR buffer.',
      'Stop-loss placed at midpoint of consolidation range or 1.5x ATR.',
      'Target 1:2 Risk-to-Reward with dynamic trailing lock.',
    ],
    defaultParams: {
      strategyId: 'FOREX_ASIAN_BREAKOUT',
      lotSize: 1.0,
      riskPerTradePct: 1.0,
      stopLossPips: 25,
      takeProfitPips: 50,
      trailingStopPips: 20,
      atrPeriod: 14,
      atrMultiplier: 1.5,
    },
  },
  {
    id: 'FOREX_MACD_RSI_MOMENTUM',
    name: 'Dual Momentum Multi-Timeframe Trend Crossover',
    tagline: 'Institutional MACD histogram divergence with RSI(14) centerline filter.',
    category: 'Momentum Trend',
    recommendedPairs: ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X'],
    description:
      'Trend-following system designed for liquid major FX pairs. Combines Fast/Slow Exponential Moving Averages (EMA 21/55), MACD histogram positive acceleration, and RSI > 50 filter.',
    rulesSummary: [
      'Trend Filter: Fast EMA (21) > Slow EMA (55) for Bullish regime.',
      'Trigger: MACD Signal line cross upward with positive histogram expansion.',
      'Confirmation: RSI(14) above 50 and rising (not overbought < 75).',
      'Dynamic Exit: Opposite MACD cross or 2.0x ATR trailing chandelier.',
    ],
    defaultParams: {
      strategyId: 'FOREX_MACD_RSI_MOMENTUM',
      lotSize: 1.0,
      riskPerTradePct: 1.0,
      emaFast: 12,
      emaSlow: 26,
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      stopLossPips: 30,
      takeProfitPips: 60,
      trailingStopPips: 25,
      atrPeriod: 14,
    },
  },
  {
    id: 'FOREX_BB_MEAN_REVERSION',
    name: 'Bollinger Band 2.0σ Reversal & RSI Exhaustion',
    tagline: 'High-win-rate counter-trend harvesting for range-bound currency pairs.',
    category: 'Volatility Bands',
    recommendedPairs: ['EURUSD=X', 'USDINR=X'],
    description:
      'Mean-reversion quant model capturing overextended currency moves. Triggers entries when candle tags or pierces 2.0 standard deviation outer band while RSI signals extreme exhaustion.',
    rulesSummary: [
      'Long: Price pierces Lower Bollinger Band and RSI(14) is oversold (< 30).',
      'Short: Price pierces Upper Bollinger Band and RSI(14) is overbought (> 70).',
      'First Target: Middle SMA(20) baseline; Second Target: Opposite band.',
      'Stop-loss: Fixed 25-35 pips beyond swing extremes.',
    ],
    defaultParams: {
      strategyId: 'FOREX_BB_MEAN_REVERSION',
      lotSize: 1.0,
      riskPerTradePct: 1.0,
      bbLength: 20,
      bbStdDev: 2.0,
      rsiPeriod: 14,
      rsiOverbought: 70,
      rsiOversold: 30,
      stopLossPips: 20,
      takeProfitPips: 40,
      trailingStopPips: 15,
      atrPeriod: 14,
    },
  },
  {
    id: 'FOREX_DONCHIAN_TREND',
    name: 'Donchian 20-Day Channel Turtle FX Trend',
    tagline: 'Classic systematic trend following capturing multi-week macro currency trends.',
    category: 'Trend Channel',
    recommendedPairs: ['GBPUSD=X', 'EURUSD=X', 'USDJPY=X'],
    description:
      'Systematic macro trend model derived from Richard Dennis turtle rules. Follows multi-month trend breakouts with rigorous volatility stop-outs.',
    rulesSummary: [
      'Long Entry: Daily Close breaks out to a new 20-period High.',
      'Short Entry: Daily Close breaks down to a new 20-period Low.',
      'Trailing Stop: 10-period opposing channel boundary.',
      'Sizing: Dynamic pip risk based on 20-day Average True Range.',
    ],
    defaultParams: {
      strategyId: 'FOREX_DONCHIAN_TREND',
      lotSize: 1.0,
      riskPerTradePct: 1.0,
      donchianPeriod: 20,
      stopLossPips: 35,
      takeProfitPips: 80,
      trailingStopPips: 30,
      atrPeriod: 14,
    },
  },
];

export interface ForexBacktestResult {
  symbol: string;
  pairInfo: ForexPairInfo;
  strategy: ForexStrategyDefinition;
  candles: Candle[];
  trades: Trade[];
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
  equityCurve: {
    time: string;
    equityUSD: number;
    drawdownPct: number;
  }[];
}

/**
 * Calculates ATR on given candle array
 */
function calculateATRArray(candles: Candle[], period = 14): number[] {
  const atr: number[] = new Array(candles.length).fill(0);
  if (candles.length < 2) return atr;

  const tr: number[] = [candles[0].high - candles[0].low];
  for (let i = 1; i < candles.length; i++) {
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }

  let sum = 0;
  for (let i = 0; i < period && i < tr.length; i++) {
    sum += tr[i];
    atr[i] = sum / (i + 1);
  }

  for (let i = period; i < candles.length; i++) {
    atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
  }

  return atr;
}

/**
 * Calculates EMA on array
 */
function calculateEMAArray(values: number[], period: number): number[] {
  const ema: number[] = new Array(values.length).fill(0);
  if (values.length === 0) return ema;

  const k = 2 / (period + 1);
  let sum = 0;
  const initPeriod = Math.min(period, values.length);
  for (let i = 0; i < initPeriod; i++) {
    sum += values[i];
  }
  ema[initPeriod - 1] = sum / initPeriod;

  for (let i = 0; i < initPeriod - 1; i++) {
    ema[i] = values[i];
  }

  for (let i = initPeriod; i < values.length; i++) {
    ema[i] = values[i] * k + ema[i - 1] * (1 - k);
  }
  return ema;
}

/**
 * Calculates RSI on array
 */
function calculateRSIArray(candles: Candle[], period = 14): number[] {
  const rsi: number[] = new Array(candles.length).fill(50);
  if (candles.length <= period) return rsi;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi[period] = 100 - 100 / (1 + rs);

  for (let i = period + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi[i] = 100 - 100 / (1 + rs);
  }

  return rsi;
}

/**
 * Executes bar-by-bar Forex backtest on real candle data
 */
export function runForexBacktest(
  candles: Candle[],
  pairInfo: ForexPairInfo,
  strategyDef: ForexStrategyDefinition,
  customParams?: Partial<ForexStrategyParams>,
  initialCapitalUSD = 10000,
  usdInrRate = 86.50
): ForexBacktestResult {
  const params: ForexStrategyParams = {
    ...strategyDef.defaultParams,
    ...customParams,
  };

  if (!candles || candles.length < 30) {
    return {
      symbol: pairInfo.symbol,
      pairInfo,
      strategy: strategyDef,
      candles: candles || [],
      trades: [],
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
      equityCurve: [{ time: 'N/A', equityUSD: initialCapitalUSD, drawdownPct: 0 }],
    };
  }

  const closes = candles.map((c) => c.close);
  const atrArray = calculateATRArray(candles, params.atrPeriod || 14);
  const rsiArray = calculateRSIArray(candles, params.rsiPeriod || 14);
  const emaFast = calculateEMAArray(closes, params.emaFast || 12);
  const emaSlow = calculateEMAArray(closes, params.emaSlow || 26);

  const trades: Trade[] = [];
  let openTrade: {
    type: 'BUY' | 'SELL';
    entryIndex: number;
    entryTime: string;
    entryPrice: number;
    units: number;
    stopLoss: number;
    takeProfit: number;
    trailStop: number;
  } | null = null;

  let currentEquityUSD = initialCapitalUSD;
  const equityCurve: { time: string; equityUSD: number; drawdownPct: number }[] = [
    { time: candles[0].time, equityUSD: initialCapitalUSD, drawdownPct: 0 },
  ];
  let peakEquityUSD = initialCapitalUSD;
  let maxDrawdownUSD = 0;
  let maxDrawdownPct = 0;
  let totalPips = 0;

  const pipSize = pairInfo.pipSize;
  const spreadPrice = pairInfo.spreadPips * pipSize;

  for (let i = 25; i < candles.length; i++) {
    const c = candles[i];
    const prevC = candles[i - 1];
    const atr = atrArray[i] || (pipSize * 30);
    const rsi = rsiArray[i];

    // Check open trade exits
    if (openTrade) {
      let isExit = false;
      let exitPrice = 0;
      let exitReason: ExitReason = 'TAKE_PROFIT';

      if (openTrade.type === 'BUY') {
        // Trailing stop update
        const trailDist = (params.trailingStopPips || 25) * pipSize;
        if (c.close - trailDist > openTrade.trailStop) {
          openTrade.trailStop = c.close - trailDist;
        }

        if (c.low <= openTrade.stopLoss) {
          isExit = true;
          exitPrice = openTrade.stopLoss;
          exitReason = 'STOP_LOSS';
        } else if (c.low <= openTrade.trailStop) {
          isExit = true;
          exitPrice = openTrade.trailStop;
          exitReason = 'TRAILING_STOP';
        } else if (c.high >= openTrade.takeProfit) {
          isExit = true;
          exitPrice = openTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          isExit = true;
          exitPrice = c.close;
          exitReason = 'SESSION_CLOSE';
        }
      } else {
        // SELL
        const trailDist = (params.trailingStopPips || 25) * pipSize;
        if (c.close + trailDist < openTrade.trailStop) {
          openTrade.trailStop = c.close + trailDist;
        }

        if (c.high >= openTrade.stopLoss) {
          isExit = true;
          exitPrice = openTrade.stopLoss;
          exitReason = 'STOP_LOSS';
        } else if (c.high >= openTrade.trailStop) {
          isExit = true;
          exitPrice = openTrade.trailStop;
          exitReason = 'TRAILING_STOP';
        } else if (c.low <= openTrade.takeProfit) {
          isExit = true;
          exitPrice = openTrade.takeProfit;
          exitReason = 'TAKE_PROFIT';
        } else if (i === candles.length - 1) {
          isExit = true;
          exitPrice = c.close;
          exitReason = 'SESSION_CLOSE';
        }
      }

      if (isExit) {
        // Calculate PnL in USD
        let pipDiff = 0;
        if (openTrade.type === 'BUY') {
          pipDiff = (exitPrice - openTrade.entryPrice) / pipSize;
        } else {
          pipDiff = (openTrade.entryPrice - exitPrice) / pipSize;
        }

        // Standard lot (100k) has ~$10/pip on USD quote pairs
        const pipValuePerUnit = pipSize / (pairInfo.quoteCurrency === 'USD' ? 1.0 : exitPrice);
        const tradePnlUSD = pipDiff * pipSize * openTrade.units;
        const pnlPct = (tradePnlUSD / currentEquityUSD) * 100;

        currentEquityUSD += tradePnlUSD;
        totalPips += pipDiff;

        if (currentEquityUSD > peakEquityUSD) {
          peakEquityUSD = currentEquityUSD;
        }
        const currentDdUSD = peakEquityUSD - currentEquityUSD;
        const currentDdPct = (currentDdUSD / peakEquityUSD) * 100;
        if (currentDdUSD > maxDrawdownUSD) maxDrawdownUSD = currentDdUSD;
        if (currentDdPct > maxDrawdownPct) maxDrawdownPct = currentDdPct;

        trades.push({
          id: `forex-${pairInfo.symbol}-${trades.length + 1}`,
          type: openTrade.type,
          entryIndex: openTrade.entryIndex,
          entryTime: openTrade.entryTime,
          entryPrice: openTrade.entryPrice,
          exitIndex: i,
          exitTime: c.time,
          exitPrice,
          qty: openTrade.units,
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

    // If no open trade, check entry signals
    if (!openTrade && i < candles.length - 1) {
      let signal: 'BUY' | 'SELL' | null = null;
      let slPrice = 0;
      let tpPrice = 0;

      if (strategyDef.id === 'FOREX_ASIAN_BREAKOUT') {
        // Consolidation lookback 15 bars
        let rangeHigh = -Infinity;
        let rangeLow = Infinity;
        for (let j = i - 15; j < i; j++) {
          if (candles[j].high > rangeHigh) rangeHigh = candles[j].high;
          if (candles[j].low < rangeLow) rangeLow = candles[j].low;
        }

        const breakoutBuffer = atr * 0.25;
        if (c.close > rangeHigh + breakoutBuffer && prevC.close <= rangeHigh) {
          signal = 'BUY';
          slPrice = rangeLow + (rangeHigh - rangeLow) * 0.5; // midpoint
          const risk = c.close - slPrice;
          tpPrice = c.close + risk * 2.0;
        } else if (c.close < rangeLow - breakoutBuffer && prevC.close >= rangeLow) {
          signal = 'SELL';
          slPrice = rangeHigh - (rangeHigh - rangeLow) * 0.5;
          const risk = slPrice - c.close;
          tpPrice = c.close - risk * 2.0;
        }
      } else if (strategyDef.id === 'FOREX_MACD_RSI_MOMENTUM') {
        const isBullRegime = emaFast[i] > emaSlow[i] && closes[i] > emaFast[i];
        const isBearRegime = emaFast[i] < emaSlow[i] && closes[i] < emaFast[i];
        const macdCrossUp = (emaFast[i] - emaSlow[i]) > (emaFast[i - 1] - emaSlow[i - 1]);
        const macdCrossDown = (emaFast[i] - emaSlow[i]) < (emaFast[i - 1] - emaSlow[i - 1]);

        if (isBullRegime && macdCrossUp && rsi > 50 && rsi < 72) {
          signal = 'BUY';
          const slPips = (params.stopLossPips || 30) * pipSize;
          slPrice = c.close - Math.max(slPips, atr * 1.5);
          tpPrice = c.close + (c.close - slPrice) * 2.0;
        } else if (isBearRegime && macdCrossDown && rsi < 50 && rsi > 28) {
          signal = 'SELL';
          const slPips = (params.stopLossPips || 30) * pipSize;
          slPrice = c.close + Math.max(slPips, atr * 1.5);
          tpPrice = c.close - (slPrice - c.close) * 2.0;
        }
      } else if (strategyDef.id === 'FOREX_BB_MEAN_REVERSION') {
        // 20-period SMA & StDev
        let sum = 0;
        for (let j = i - 20; j < i; j++) sum += closes[j];
        const mean = sum / 20;
        let varianceSum = 0;
        for (let j = i - 20; j < i; j++) varianceSum += Math.pow(closes[j] - mean, 2);
        const stdDev = Math.sqrt(varianceSum / 20);
        const upperBB = mean + (params.bbStdDev || 2.0) * stdDev;
        const lowerBB = mean - (params.bbStdDev || 2.0) * stdDev;

        if (c.low <= lowerBB && rsi < (params.rsiOversold || 30)) {
          signal = 'BUY';
          slPrice = c.close - (params.stopLossPips || 25) * pipSize;
          tpPrice = mean; // Revert to mean
        } else if (c.high >= upperBB && rsi > (params.rsiOverbought || 70)) {
          signal = 'SELL';
          slPrice = c.close + (params.stopLossPips || 25) * pipSize;
          tpPrice = mean;
        }
      } else if (strategyDef.id === 'FOREX_DONCHIAN_TREND') {
        const period = params.donchianPeriod || 20;
        let highestHigh = -Infinity;
        let lowestLow = Infinity;
        for (let j = i - period; j < i; j++) {
          if (candles[j].high > highestHigh) highestHigh = candles[j].high;
          if (candles[j].low < lowestLow) lowestLow = candles[j].low;
        }

        if (c.close > highestHigh) {
          signal = 'BUY';
          slPrice = c.close - (params.stopLossPips || 35) * pipSize;
          tpPrice = c.close + (c.close - slPrice) * 2.5;
        } else if (c.close < lowestLow) {
          signal = 'SELL';
          slPrice = c.close + (params.stopLossPips || 35) * pipSize;
          tpPrice = c.close - (slPrice - c.close) * 2.5;
        }
      }

      if (signal) {
        // Enforce 1% capital risk sizing
        const riskUSD = currentEquityUSD * ((params.riskPerTradePct || 1.0) / 100);
        const stopDistance = Math.abs(c.close - slPrice);
        const units = stopDistance > 0 ? Math.floor(riskUSD / stopDistance) : 10000;
        const entryPrice = signal === 'BUY' ? c.close + spreadPrice : c.close - spreadPrice;

        openTrade = {
          type: signal,
          entryIndex: i,
          entryTime: c.time,
          entryPrice,
          units: Math.max(units, 1000), // Min micro lot
          stopLoss: slPrice,
          takeProfit: tpPrice,
          trailStop: slPrice,
        };
      }
    }

    equityCurve.push({
      time: c.time,
      equityUSD: currentEquityUSD,
      drawdownPct: peakEquityUSD > 0 ? ((peakEquityUSD - currentEquityUSD) / peakEquityUSD) * 100 : 0,
    });
  }

  // Calculate summary metrics
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

  // Approximate Sharpe Ratio
  const returns = trades.map((t) => t.pnlPct);
  const meanReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1
    ? returns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / (returns.length - 1)
    : 0;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? (meanReturn / stdDev) * Math.sqrt(252) : 0;

  // Approximate CAGR
  const years = Math.max(candles.length / 252, 0.25);
  const cagrPct = (Math.pow(Math.max(currentEquityUSD / initialCapitalUSD, 0.01), 1 / years) - 1) * 100;

  return {
    symbol: pairInfo.symbol,
    pairInfo,
    strategy: strategyDef,
    candles,
    trades,
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
  };
}
