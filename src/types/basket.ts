import { Candle, StrategyParams, Trade, EquityPoint } from './backtest';
import { NseStock } from '../services/nseStocks';

export type BasketStrategyType = 'PSAR_SMA100' | 'OPENING_RANGE' | 'STOCHASTIC';

export interface BasketItem {
  id: string;
  stock: NseStock;
  strategyType: BasketStrategyType;
  timeframe: string; // '1d' | '4h' | '1h' | '15m' | '5m'
  riskPerTradePct: number; // RPT % (e.g., 1.0 = 1% Risk Per Trade)
  enabled: boolean;
  customParams?: Partial<StrategyParams>;
}

export interface StrategyBasket {
  id: string;
  name: string;
  description?: string;
  initialCapital: number;
  items: BasketItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BasketTrade extends Trade {
  symbol: string;
  stockName: string;
  strategyType: BasketStrategyType;
  rptPct: number; // RPT column
  riskAmount: number;
}

export interface BasketItemBreakdown {
  id: string;
  symbol: string;
  stockName: string;
  strategyType: BasketStrategyType;
  timeframe: string;
  rptPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  netPnl: number;
  returnPct: number;
  profitFactor: number;
}

export interface BasketBacktestResult {
  basketName: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  totalReturnPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdownPct: number;
  maxDrawdownVal: number;
  equityCurve: EquityPoint[];
  trades: BasketTrade[];
  breakdown: BasketItemBreakdown[];
}
