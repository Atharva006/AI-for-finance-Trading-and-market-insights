import { FlowNodeType, NodeDocumentation } from '../types/flow';

export const NODE_DOCUMENTATION_MAP: Record<FlowNodeType, NodeDocumentation> = {
  TRIGGER_FEED: {
    title: 'NSE Market Feed Trigger',
    category: 'feed',
    summary: 'The primary initiation trigger for the entire algorithmic flow. Streams historical or real-time daily/intraday candles.',
    mathExplanation: 'Retrieves Open, High, Low, Close, Volume (OHLCV) arrays for selected NSE stocks or indices (e.g. INFY, RELIANCE, NIFTY 50). Verifies timestamp sequence, checks for missing bars, and resamples to target intervals.',
    pineScriptEquiv: '// Pine Script data feed\n[open, high, low, close, volume]',
    inputs: [],
    outputs: [
      { portId: 'out-candles', label: 'Candles', dataType: 'Candle[]', description: 'Emits chronologically sorted OHLCV candle array.' },
    ],
    parameters: [
      { key: 'symbol', label: 'NSE Symbol', type: 'select', description: 'Target equity or index listed on National Stock Exchange.', defaultValue: 'INFY' },
      { key: 'timeframe', label: 'Timeframe', type: 'select', description: 'Candle duration (1D, 4H, 1H, 15M, 5M).', defaultValue: '1d' },
      { key: 'initialCapital', label: 'Account Margin (₹)', type: 'number', description: 'Starting portfolio equity allocated to this flow.', defaultValue: 100000 },
    ],
  },
  INDICATOR_PSAR: {
    title: 'Parabolic SAR (Wilder ta.sar)',
    category: 'indicator',
    summary: 'Trend-following and trailing stop reversal indicator developed by J. Welles Wilder Jr.',
    mathExplanation: 'Calculates SAR recursively: SAR[i] = SAR[i-1] + AF * (EP - SAR[i-1]). In an uptrend, SAR is constrained below the prior 2 candle lows. If price penetrates SAR, a direction flip occurs and AF resets to start.',
    pineScriptEquiv: 'ta.sar(start, step, max) // © Atharva Bhosale Pine Script v5',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires OHLCV candle series from Feed node.' },
    ],
    outputs: [
      { portId: 'out-psar', label: 'PSAR Points', dataType: 'number[]', description: 'Emits calculated Parabolic SAR price curve.' },
    ],
    parameters: [
      { key: 'start', label: 'Start AF', type: 'number', description: 'Initial Acceleration Factor (typically 0.01).', defaultValue: 0.01 },
      { key: 'step', label: 'Step AF', type: 'number', description: 'Acceleration Factor increment per higher high/lower low (0.01).', defaultValue: 0.01 },
      { key: 'max', label: 'Max AF', type: 'number', description: 'Maximum ceiling for Acceleration Factor (0.10).', defaultValue: 0.10 },
    ],
  },
  INDICATOR_SMA: {
    title: 'Simple Moving Average (SMA)',
    category: 'indicator',
    summary: 'Trend baseline smoothing price action over N periods with slope direction detection.',
    mathExplanation: 'SMA[i] = (sum of close[i - N + 1 ... i]) / N. Slope is determined by comparing SMA[i] to SMA[i-1] (Rising when SMA[i] > SMA[i-1], Falling when SMA[i] < SMA[i-1]).',
    pineScriptEquiv: 'sma100 = ta.sma(close, 100)\nsma_rising = sma100 > sma100[1]',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires OHLCV candle series from Feed node.' },
    ],
    outputs: [
      { portId: 'out-sma', label: 'SMA Baseline', dataType: 'number[]', description: 'Emits SMA curve values and trend slope state.' },
    ],
    parameters: [
      { key: 'length', label: 'SMA Period Length', type: 'number', description: 'Number of bars for moving average calculation (e.g. 100 or 200).', defaultValue: 100 },
    ],
  },
  INDICATOR_EMA: {
    title: 'Exponential Moving Average (EMA)',
    category: 'indicator',
    summary: 'Weighted moving average giving exponentially higher importance to recent price bars.',
    mathExplanation: 'Multiplier k = 2 / (Length + 1). EMA[i] = (Close[i] - EMA[i-1]) * k + EMA[i-1]. Reacts faster to price shocks than simple SMA.',
    pineScriptEquiv: 'ema = ta.ema(close, length)',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires candle stream.' },
    ],
    outputs: [
      { portId: 'out-ema', label: 'EMA Line', dataType: 'number[]', description: 'Emits EMA values for fast/slow crossovers.' },
    ],
    parameters: [
      { key: 'length', label: 'EMA Period', type: 'number', description: 'Period length (e.g. 20, 50, or 200).', defaultValue: 20 },
    ],
  },
  INDICATOR_RSI: {
    title: 'Relative Strength Index (RSI)',
    category: 'indicator',
    summary: 'Momentum oscillator measuring speed and velocity of directional price movements.',
    mathExplanation: 'Computes smoothed Average Gain and Average Loss over 14 bars. Relative Strength RS = AvgGain / AvgLoss. RSI = 100 - (100 / (1 + RS)). Oversold typically < 30, Overbought > 70.',
    pineScriptEquiv: 'rsi = ta.rsi(close, 14)',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires candle stream.' },
    ],
    outputs: [
      { portId: 'out-rsi', label: 'RSI Line', dataType: 'number[]', description: 'Emits 0-100 bounded RSI values.' },
    ],
    parameters: [
      { key: 'period', label: 'RSI Period', type: 'number', description: 'Lookback length (standard 14).', defaultValue: 14 },
      { key: 'oversold', label: 'Oversold Level', type: 'number', description: 'Lower threshold trigger (30).', defaultValue: 30 },
      { key: 'overbought', label: 'Overbought Level', type: 'number', description: 'Upper threshold trigger (70).', defaultValue: 70 },
    ],
  },
  INDICATOR_MACD: {
    title: 'MACD (12, 26, 9) Oscillator',
    category: 'indicator',
    summary: 'Moving Average Convergence Divergence showing relationship between two exponential moving averages.',
    mathExplanation: 'MACD Line = EMA(12) - EMA(26). Signal Line = EMA(9) of MACD Line. Histogram = MACD Line - Signal Line. Bullish crossover occurs when MACD Line crosses above Signal Line.',
    pineScriptEquiv: '[macdLine, signalLine, histLine] = ta.macd(close, 12, 26, 9)',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires OHLCV candle stream.' },
    ],
    outputs: [
      { portId: 'out-macd', label: 'MACD / Signal', dataType: 'object', description: 'Emits MACD, Signal line and Histogram values.' },
    ],
    parameters: [
      { key: 'fastLength', label: 'Fast EMA Length', type: 'number', description: 'Short-term EMA period (12).', defaultValue: 12 },
      { key: 'slowLength', label: 'Slow EMA Length', type: 'number', description: 'Long-term EMA period (26).', defaultValue: 26 },
      { key: 'signalLength', label: 'Signal EMA Length', type: 'number', description: 'Smoothing period for signal line (9).', defaultValue: 9 },
    ],
  },
  INDICATOR_SUPERTREND: {
    title: 'Supertrend Volatility Bands',
    category: 'indicator',
    summary: 'Volatility-adjusted trend indicator utilizing Average True Range (ATR) multipliers.',
    mathExplanation: 'Upper Band = (High + Low)/2 + (Multiplier * ATR). Lower Band = (High + Low)/2 - (Multiplier * ATR). Flips direction when Close crosses opposing band.',
    pineScriptEquiv: '[st, dir] = ta.supertrend(multiplier, period)',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires candle stream.' },
    ],
    outputs: [
      { portId: 'out-st', label: 'Supertrend', dataType: 'number[]', description: 'Emits dynamic support/resistance band.' },
    ],
    parameters: [
      { key: 'period', label: 'ATR Period', type: 'number', description: 'ATR lookback period (default 10).', defaultValue: 10 },
      { key: 'multiplier', label: 'ATR Multiplier', type: 'number', description: 'Distance multiplier factor (default 3.0).', defaultValue: 3.0 },
    ],
  },
  INDICATOR_STOCHASTIC: {
    title: 'Stochastic Oscillator (%K, %D)',
    category: 'indicator',
    summary: 'Locates current close price relative to high-low range over lookback window.',
    mathExplanation: '%K = ((Close - Lowest Low) / (Highest High - Lowest Low)) * 100 smoothed over 3 bars. %D is a 3-bar moving average of %K.',
    pineScriptEquiv: 'k = ta.sma(ta.stoch(close, high, low, 14), 3)\nd = ta.sma(k, 3)',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires candle stream.' },
    ],
    outputs: [
      { portId: 'out-stoch', label: 'Stoch %K/%D', dataType: 'object', description: 'Emits %K and %D oscillator curves.' },
    ],
    parameters: [
      { key: 'kPeriod', label: '%K Period', type: 'number', description: 'Lookback length (14).', defaultValue: 14 },
      { key: 'smooth', label: '%K Smoothing', type: 'number', description: 'Smoothing period (3).', defaultValue: 3 },
      { key: 'dPeriod', label: '%D Period', type: 'number', description: '%D moving average period (3).', defaultValue: 3 },
    ],
  },
  INDICATOR_ATR: {
    title: 'Average True Range (ATR)',
    category: 'indicator',
    summary: 'Volatility measurement showing price expansion range independent of direction.',
    mathExplanation: 'True Range TR = Max(High - Low, |High - Close[1]|, |Low - Close[1]|). ATR is Wilder smoothed TR over 14 bars.',
    pineScriptEquiv: 'atr = ta.atr(14)',
    inputs: [
      { portId: 'in-candles', label: 'Candles', dataType: 'Candle[]', required: true, description: 'Requires candle stream.' },
    ],
    outputs: [
      { portId: 'out-atr', label: 'ATR Points', dataType: 'number[]', description: 'Emits volatility points in rupee distance.' },
    ],
    parameters: [
      { key: 'period', label: 'ATR Period', type: 'number', description: 'Lookback length (14).', defaultValue: 14 },
    ],
  },
  LOGIC_CROSSOVER: {
    title: 'PSAR Flip & Trend Filter Gate',
    category: 'logic',
    summary: 'Combines directional indicator flips with baseline trend filters to create trade signals.',
    mathExplanation: 'Buy Signal = (PSAR[1] > High[1]) AND (PSAR < Low) AND (SMA100 > SMA100[1]). Sell Signal = (PSAR[1] < Low[1]) AND (PSAR > High) AND (SMA100 < SMA100[1]).',
    pineScriptEquiv: 'psar_flip_buy = psar[1] > high[1] and psar < low and sma_rising\npsar_flip_sell = psar[1] < low[1] and psar > high and sma_falling',
    inputs: [
      { portId: 'in-psar', label: 'PSAR', dataType: 'number[]', required: true, description: 'Must receive PSAR points from PSAR Indicator Node.' },
      { portId: 'in-sma', label: 'SMA', dataType: 'number[]', required: true, description: 'Must receive SMA trend baseline from SMA Node.' },
    ],
    outputs: [
      { portId: 'out-buy-sig', label: 'Buy Signal', dataType: 'signal', description: 'Emits Long entry breakout signals.' },
      { portId: 'out-sell-sig', label: 'Sell Signal', dataType: 'signal', description: 'Emits Short entry breakdown signals.' },
    ],
    parameters: [
      { key: 'rule', label: 'Signal Combination', type: 'string', description: 'Enforces dual-confirmation signal logic.', defaultValue: 'PSAR Flip with SMA Slope' },
    ],
  },
  LOGIC_GATE: {
    title: 'Multi-Condition AND / OR Gate',
    category: 'logic',
    summary: 'Combines two independent signals using boolean logic before passing to order sizer.',
    mathExplanation: 'Evaluates logical conjunction (A AND B) or disjunction (A OR B). Fails closed if either input is undefined or disconnected.',
    pineScriptEquiv: 'signal = condition_a and condition_b',
    inputs: [
      { portId: 'in-1', label: 'Condition A', dataType: 'signal', required: true, description: 'Primary trigger signal.' },
      { portId: 'in-2', label: 'Condition B', dataType: 'signal', required: true, description: 'Secondary confirmation filter.' },
    ],
    outputs: [
      { portId: 'out-sig', label: 'Validated Signal', dataType: 'signal', description: 'Emits validated signal when gate condition holds true.' },
    ],
    parameters: [
      { key: 'gateType', label: 'Gate Operation', type: 'select', description: 'AND (Both required) or OR (Either fires).', defaultValue: 'AND' },
    ],
  },
  RISK_RPT: {
    title: '1% Risk Per Trade (RPT) Sizer',
    category: 'risk',
    summary: 'Calculates dynamic share quantities ensuring capital risk never exceeds exact allocation.',
    mathExplanation: 'Risk Amount = Equity * (Risk_Per_Trade / 100). Share Quantity = floor(Risk Amount / (Entry Price - Stop Loss Price)). If (Risk / Entry Price) * 100 > Max Risk %, order is aborted.',
    pineScriptEquiv: 'risk_amount = strategy.equity * (risk_per_trade / 100)\nqty = math.floor(risk_amount / risk_distance)',
    inputs: [
      { portId: 'in-sig', label: 'Signal', dataType: 'signal', required: true, description: 'Must receive validated Buy/Sell signal from Logic Gate.' },
    ],
    outputs: [
      { portId: 'out-orders', label: 'Sized Orders', dataType: 'order', description: 'Emits quantified orders with exact share allocation.' },
    ],
    parameters: [
      { key: 'riskPerTradePct', label: 'Risk Per Trade (%)', type: 'number', description: 'Strict capital percentage risked per position (1.0% = ₹1,000 on ₹1 Lakh).', defaultValue: 1.0 },
      { key: 'maxRiskPercent', label: 'Max Risk % Limit', type: 'number', description: 'Maximum allowable risk distance per trade (9.0%).', defaultValue: 9.0 },
    ],
  },
  RISK_BRACKET: {
    title: '1:2.0 RR SL / Target Bracket',
    category: 'risk',
    summary: 'Calculates dynamic Stop Loss and Profit Target boundaries with execution timeouts.',
    mathExplanation: 'Long: Entry = Signal High, SL = Low of N candles back (default 2), Target = Entry + (Risk * RR). Unfilled pending orders timeout after 2 bars.',
    pineScriptEquiv: 'buy_breakout = high\nbuy_sl = low[lookback]\nbuy_target = buy_breakout + (buy_risk * rr_ratio)',
    inputs: [
      { portId: 'in-sig', label: 'Signal', dataType: 'signal', required: true, description: 'Must receive validated signal from Logic Gate.' },
    ],
    outputs: [
      { portId: 'out-bracket', label: 'Exit Rules', dataType: 'order', description: 'Emits SL, TP, and 2-bar timeout rules.' },
    ],
    parameters: [
      { key: 'slLookback', label: 'SL Lookback Bars', type: 'number', description: 'Number of prior candles to set Stop Loss level (default 2 bars back).', defaultValue: 2 },
      { key: 'rrRatio', label: 'Risk : Reward Ratio', type: 'number', description: 'Target reward multiplier per unit of risk (default 2.0).', defaultValue: 2.0 },
    ],
  },
  ACTION_BUY: {
    title: 'Buy Order Execution',
    category: 'action',
    summary: 'Dispatches Buy Stop breakout entry order when trigger occurs.',
    mathExplanation: 'Submits pending stop order at breakout high. Fills if price hits or exceeds level within 2 bars.',
    pineScriptEquiv: 'strategy.entry("Buy", strategy.long, stop=buy_breakout)',
    inputs: [
      { portId: 'in-order', label: 'Sized Order', dataType: 'order', required: true, description: 'Receives sized order parameters.' },
    ],
    outputs: [
      { portId: 'out-pos', label: 'Position', dataType: 'order', description: 'Emits open position state.' },
    ],
    parameters: [],
  },
  ACTION_SELL: {
    title: 'Sell Order Execution',
    category: 'action',
    summary: 'Dispatches Sell Stop breakdown entry order when trigger occurs.',
    mathExplanation: 'Submits pending stop order at breakdown low. Fills if price penetrates level within 2 bars.',
    pineScriptEquiv: 'strategy.entry("Sell", strategy.short, stop=sell_breakout)',
    inputs: [
      { portId: 'in-order', label: 'Sized Order', dataType: 'order', required: true, description: 'Receives sized order parameters.' },
    ],
    outputs: [
      { portId: 'out-pos', label: 'Position', dataType: 'order', description: 'Emits open position state.' },
    ],
    parameters: [],
  },
  OUTPUT_TELEMETRY: {
    title: 'Execution Telemetry & Logs',
    category: 'output',
    summary: 'Aggregates all filled trades, calculates institutional metrics, and plots the equity curve.',
    mathExplanation: 'Computes Net Return, Win Rate %, Profit Factor, Max Drawdown %, and produces trade logs with chronological telemetry.',
    pineScriptEquiv: '// Backtest Performance Dashboard & Equity Curve',
    inputs: [
      { portId: 'in-orders', label: 'Orders', dataType: 'order', required: true, description: 'Receives order stream from Risk Sizer.' },
      { portId: 'in-bracket', label: 'Exits', dataType: 'order', required: true, description: 'Receives SL & Target rules from Bracket node.' },
    ],
    outputs: [],
    parameters: [],
  },
};
