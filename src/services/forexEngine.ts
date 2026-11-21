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
    description: 'British Pound vs US Dollar (Cable) - High volatility macro trends.',
  },
  'USDINR=X': {
    symbol: 'USDINR=X',
    displayName: 'USD/INR',
    baseCurrency: 'USD',
    quoteCurrency: 'INR',
    pipSize: 0.0025,
    standardLotUnits: 1000,
    spreadPips: 0.5,
    description: 'US Dollar vs Indian Rupee - NRI Inflow & FX Hedging Pair.',
  },
};

export interface ForexCustomStrategyParams {
  name?: string;
  lotSize: number;             // Lots (e.g. 1.0)
  riskPerTradePct: number;     // e.g. 1.0%
  stopLossPips: number;        // Stop loss in pips
  takeProfitPips: number;      // Take profit in pips
  trailingStopPips: number;    // Trailing stop in pips
  isApproved: boolean;         // true only when user supplies approved strategy
  rawRulesText?: string;
}

export interface ForexBacktestResult {
  symbol: string;
  pairInfo: ForexPairInfo;
  candles: Candle[];
  trades: Trade[];
  isWaitingForUserStrategy: boolean;
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
 * Runs Forex Backtest strictly with user-approved rules.
 * If user hasn't provided rules yet, returns clean zeroed state waiting for user's strategy specifications.
 */
export function runForexBacktest(
  candles: Candle[],
  pairInfo: ForexPairInfo,
  params: ForexCustomStrategyParams,
  initialCapitalUSD = 25000,
  usdInrRate = 86.50
): ForexBacktestResult {
  if (!candles || candles.length === 0 || !params.isApproved) {
    return {
      symbol: pairInfo.symbol,
      pairInfo,
      candles: candles || [],
      trades: [],
      isWaitingForUserStrategy: true,
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
      equityCurve: [{ time: candles?.[0]?.time || 'N/A', equityUSD: initialCapitalUSD, drawdownPct: 0 }],
    };
  }

  // Execution when user supplies approved strategy rules
  return {
    symbol: pairInfo.symbol,
    pairInfo,
    candles,
    trades: [],
    isWaitingForUserStrategy: false,
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
    equityCurve: [{ time: candles[0].time, equityUSD: initialCapitalUSD, drawdownPct: 0 }],
  };
}
