export interface Candle {
  time: string;
  timestamp: number;
  isoString?: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  stochK?: number;
  stochD?: number;
  atr?: number;
  psar?: number;
  sma100?: number;
}

export type TradeType = 'BUY' | 'SELL';
export type ExitReason = 'TAKE_PROFIT' | 'STOP_LOSS' | 'TRAILING_STOP' | 'STOCH_REVERSAL' | 'SESSION_CLOSE' | 'TIMEOUT_CANCEL' | 'LIMIT_TARGET' | 'CHANDELIER_TRAIL' | 'TIME_STOP';
export type PositionMode = 'BOTH' | 'LONG_ONLY' | 'SHORT_ONLY';

export interface Trade {
  id: string;
  type: TradeType;
  entryIndex: number;
  entryTime: string;
  entryPrice: number;
  exitIndex: number;
  exitTime: string;
  exitPrice: number;
  qty: number;
  pnl: number;
  pnlPct: number;
  exitReason: ExitReason;
  stopLoss: number;
  takeProfit: number;
  atrAtEntry?: number;
  stochKAtEntry?: number;
  stochDAtEntry?: number;
  riskDist?: number;
}

export interface StrategyParams {
  strategyType?: 'STOCHASTIC' | 'OPENING_RANGE' | 'PSAR_SMA100' | 'TREND_PULLBACK_CHANDELIER';

  // Nifty50 Trend-Pullback + Chandelier Strategy parameters (Pine Script v5)
  fastEmaLength?: number;          // default 50
  slowEmaLength?: number;          // default 200
  slopeLookback?: number;          // default 20
  adxLength?: number;              // default 14
  adxMin?: number;                 // default 20.0
  rsiPullbackLen?: number;         // default 5
  rsiOversold?: number;            // default 30.0
  rsiOverbought?: number;          // default 70.0
  swingStopLookback?: number;      // default 5
  atrFloorMultiplier?: number;     // default 1.0 (Min stop distance xATR)
  chandelierAtrMultiplier?: number;// default 3.0 (Chandelier multiple xATR)
  timeStopBars?: number;           // default 30
  allowShort?: boolean;            // default true
  maxNotionalPct?: number;         // default 100

  
  // Opening Range Breakout (ORB 5M) parameters
  orbTimeframeMinutes?: number; // 5m default
  orbSlBodyPct?: number;        // default 0.70 (70% of 5m candle body)
  orbRiskReward?: number;       // default 1.5 (1:1.5 RR)
  orbRiskPerTradeINR?: number;  // default 1000 (1% of 100,000 INR)

  // PSAR + SMA100 Swing Strategy parameters
  tradeDir?: 'Both' | 'Buy Only' | 'Sell Only'; // Trade Direction toggle
  psarStart?: number;       // default 0.01 (AF start)
  psarStep?: number;        // default 0.01 (AF increment)
  psarMax?: number;         // default 0.10 (AF max)
  smaLength?: number;       // default 100 (SMA 100)
  slLookback?: number;      // default 2 (N candles back for SL)
  rrRatio?: number;         // default 2.0 (Risk : Reward ratio)
  riskRewardRatio?: number; // default 2.0 (Risk : Reward ratio alias)
  maxRiskPercent?: number;  // default 9.0 (Max risk % per trade)

  // Stochastic parameters
  stochKPeriod: number; // default 14
  stochSmooth: number;  // default 3 (%K smoothing)
  stochDPeriod: number; // default 3 (%D period)
  stochOverbought: number; // default 80
  stochOversold: number;   // default 20

  // Indicator toggles & options
  enableAtr?: boolean;         // Optional toggle to enable/disable ATR completely
  enabledIndicators?: string[]; // Dynamic indicator list (e.g., ['ATR', 'EMA_20', 'RSI', 'PSAR', 'SMA100'])
  fixedSlPct?: number;         // Fixed SL % when ATR is disabled (default 1.0%)
  fixedTpPct?: number;         // Fixed TP % when ATR is disabled (default 2.0%)

  // Data Provider & Historical Range options
  dataProvider?: 'upstox' | 'yahoo';
  historyRange?: '300d' | '1y' | '3y' | '5y' | '10y' | 'max' | 'custom';

  // ATR parameters
  atrPeriod: number;       // default 14
  atrSlMultiplier: number; // default 1.5x ATR
  atrTpMultiplier: number; // default 3.0x ATR
  useTrailingStop: boolean; // default true

  // Money & Execution Management
  initialCapital: number;    // default ₹1,00,000
  riskPerTradePct: number;   // default 1.0% (₹1,000)
  slippagePoints: number;    // default 1.0 pt
  brokeragePerOrder: number; // default ₹20 per executed order
  positionMode: PositionMode;
}

export interface EquityPoint {
  time: string;
  equity: number;
  benchmarkEquity: number;
  drawdownPct: number;
}

export interface BacktestMetrics {
  totalReturn: number;
  totalReturnPct: number;
  benchmarkReturnPct: number;
  alphaPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  maxDrawdownPct: number;
  maxDrawdownVal: number;
  sharpeRatio: number;
  sortinoRatio: number;
  avgTradePnl: number;
  avgWinPnl: number;
  avgLossPnl: number;
  riskRewardRatio: number;
  avgHoldingBars: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface BacktestResult {
  params: StrategyParams;
  candles: Candle[];
  trades: Trade[];
  equityCurve: EquityPoint[];
  metrics: BacktestMetrics;
}

export interface UpstoxConfig {
  apiKey: string;
  apiSecret?: string;
  accessToken: string;
  instrumentKey: string;
  timeframe: string;
  fromDate: string;
  toDate: string;
  isMock: boolean;
}
