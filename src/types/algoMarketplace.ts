import { StrategyParams } from './backtest';

export interface WorstDrawdownRecord {
  month: string;
  lossPct: number;
  recoveryDays: number;
  maxDdDate: string;
  peakValue?: number;
  troughValue?: number;
}

export interface MonthlyDistributionBand {
  range: string;
  months: number;
  color: string;
  pct: number; // 0-100 for bar width
}

export interface PastTradeRecord {
  id: string;
  date: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  pnlPct: number;
  capital: number;
  status: 'WIN' | 'LOSS';
  holdingDuration?: string;
}

export interface AlgoStrategy {
  id: string;
  name: string;
  tagline: string;
  category: string;
  style: string;
  marginRequired: number; // in INR
  rollingReturn1m: number; // %
  return3m: number;
  return6m: number;
  return1y: number;
  winRate: number;
  maxDrawdown: number;
  isEarlyAccess?: boolean;
  isPopular?: boolean;
  capitalTier: 'under_10k' | 'under_50k' | 'under_100k' | 'under_200k' | 'above_200k';
  sparkline: number[];
  defaultParams?: Partial<StrategyParams>;
  description: string;

  // Investment vs Trading Classification
  isInvestmentAlgo?: boolean; // Investment algos start below ₹10k - ₹1L with longer horizons
  segment?: 'Cash/Equity' | 'Delivery' | 'Futures & Options' | 'Overnight Funds';
  marketRegime?: 'Directional' | 'Sideways' | 'High Volatility' | 'Trend Following';
  tradeType?: string; // e.g. 'Credit Spread', 'Breakout Swing', 'Mean Reversion'

  // Algo Trade Metrics
  avgFrequency?: string; // e.g. '2 trades a week'
  avgProfitPct?: number; // e.g. 3.4
  avgLossPct?: number; // e.g. -1.2
  riskCategory?: 'Low' | 'Medium' | 'High' | 'Very High';
  avgRecoveryDays?: number; // e.g. 4.2
  maxRecoveryDays?: number; // e.g. 14
  volatilityPct?: number; // e.g. 12.8
  riskRewardRatio?: string; // e.g. '1:2.5'

  // Consistency Metrics
  winDaysPct?: number; // e.g. 64.2
  winMonthsPct?: number; // e.g. 78.5
  maxConsecutiveWins?: number; // e.g. 6
  maxConsecutiveLosses?: number; // e.g. 2

  // Institutional Efficiency Scores (Sharpe, Sortino, Calmar, Alpha)
  sharpeRatio?: number;
  sortinoRatio?: number;
  calmarRatio?: number;
  alphaPct?: number;

  // Drawdowns & Distribution
  worst5Drawdowns?: WorstDrawdownRecord[];
  monthlyDistribution?: MonthlyDistributionBand[];
  pastTrades?: PastTradeRecord[];

  // Visual Assets & Custom Branding
  badgeImage?: string; // Unique image/badge identifier
  
  // Custom Strategy & Admin Builder Fields
  isCustom?: boolean;
  isPublished?: boolean;
  promptRules?: string;
  targetSymbol?: string; // e.g. 'RELIANCE', 'TCS', 'NIFTY 50'
  targetInstrumentKey?: string; // e.g. 'NSE_EQ|INE002A01018'
  timeframe?: string; // '1m', '5m', '15m', '30m', '1h', '1d'
  createdAt?: string;
  author?: string;
}

export const INITIAL_EMPTY_STRATEGIES: AlgoStrategy[] = [];
