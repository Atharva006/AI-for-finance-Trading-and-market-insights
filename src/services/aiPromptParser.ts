import { StrategyParams } from '../types/backtest';
import { FlowNode, FlowConnection } from '../types/flow';

export interface ParsedStrategyPrompt {
  promptText: string;
  symbol: string;
  timeframe: '1d' | '4h' | '1h' | '15m' | '5m';
  strategyType: 'PSAR_SMA100' | 'OPENING_RANGE' | 'STOCHASTIC';
  params: Partial<StrategyParams>;
  explanation: string;
  nodes?: FlowNode[];
  connections?: FlowConnection[];
}

export const PRESET_AI_PROMPTS = [
  {
    label: 'Conservative INFY Swing',
    prompt:
      'Conservative INFY Swing: Buy on PSAR flip with 100 SMA trend confirmation, strict 1% RPT capital risk, and 1:2.0 risk-to-reward bracket.',
  },
  {
    label: 'Tata Motors 5M ORB Breakout',
    prompt:
      'Tata Motors 5M ORB Breakout: Trade 09:15-09:20 opening range with 70% candle body Stop Loss, 1% risk per trade, and 1:1.5 target.',
  },
  {
    label: 'Nifty 50 Stochastic Swing',
    prompt:
      'Nifty 50 Stochastic Momentum: Enter long when %K crosses %D below 20 with 1.2x ATR trailing stop and 1:3.0 profit target.',
  },
  {
    label: 'Reliance Trend Follower',
    prompt:
      'Reliance Daily Trend: Wilder PSAR (0.01 start, 0.01 step, 0.1 max) combined with 100-period SMA slope filter and 2-bar low SL.',
  },
];

/**
 * Natural Language Parser for Trading Strategies
 * Converts plain English strategy specifications into formal backtest configurations and flow DAGs.
 */
export function parseNaturalLanguageStrategy(prompt: string): ParsedStrategyPrompt {
  const lower = prompt.toLowerCase();

  // 1. Detect Symbol
  let symbol = 'INFY';
  if (lower.includes('reliance')) symbol = 'RELIANCE';
  else if (lower.includes('tcs')) symbol = 'TCS';
  else if (lower.includes('tata motors') || lower.includes('tatamotors')) symbol = 'TATAMOTORS';
  else if (lower.includes('hdfc')) symbol = 'HDFCBANK';
  else if (lower.includes('nifty 50') || lower.includes('nifty')) symbol = 'NIFTY 50';
  else if (lower.includes('bank') || lower.includes('nifty bank')) symbol = 'NIFTY BANK';
  else if (lower.includes('itc')) symbol = 'ITC';
  else if (lower.includes('bharti') || lower.includes('airtel')) symbol = 'BHARTIARTL';
  else if (lower.includes('l&t') || lower.includes('lt')) symbol = 'LT';
  else if (lower.includes('icici')) symbol = 'ICICIBANK';

  // 2. Detect Timeframe
  let timeframe: '1d' | '4h' | '1h' | '15m' | '5m' = '1d';
  if (lower.includes('5m') || lower.includes('5 min')) timeframe = '5m';
  else if (lower.includes('15m') || lower.includes('15 min')) timeframe = '15m';
  else if (lower.includes('1h') || lower.includes('60m') || lower.includes('hourly')) timeframe = '1h';
  else if (lower.includes('4h')) timeframe = '4h';
  else if (lower.includes('daily') || lower.includes('1d') || lower.includes('swing')) timeframe = '1d';

  // 3. Detect Strategy Type
  let strategyType: 'PSAR_SMA100' | 'OPENING_RANGE' | 'STOCHASTIC' = 'PSAR_SMA100';
  if (lower.includes('orb') || lower.includes('opening range')) {
    strategyType = 'OPENING_RANGE';
    timeframe = '5m';
  } else if (lower.includes('stochastic') || lower.includes('%k') || lower.includes('stoch')) {
    strategyType = 'STOCHASTIC';
  } else if (lower.includes('psar') || lower.includes('parabolic') || lower.includes('sma')) {
    strategyType = 'PSAR_SMA100';
  }

  // 4. Extract Risk Per Trade %
  let rpt = 1.0;
  const rptMatch = prompt.match(/(\d+(\.\d+)?)%\s*(rpt|risk)/i);
  if (rptMatch) {
    rpt = parseFloat(rptMatch[1]);
  }

  // 5. Extract RR Ratio
  let rrRatio = 2.0;
  const rrMatch = prompt.match(/1\s*:\s*(\d+(\.\d+)?)/i);
  if (rrMatch) {
    rrRatio = parseFloat(rrMatch[1]);
  }

  // 6. Extract PSAR Parameters
  let psarStart = 0.01;
  let psarStep = 0.01;
  let psarMax = 0.10;
  let smaLength = 100;

  if (lower.includes('0.02')) {
    psarStart = 0.02;
    psarStep = 0.02;
    psarMax = 0.20;
  }

  if (lower.includes('50 sma') || lower.includes('sma 50')) {
    smaLength = 50;
  } else if (lower.includes('200 sma') || lower.includes('sma 200')) {
    smaLength = 200;
  }

  // Build params
  const params: Partial<StrategyParams> = {
    strategyType,
    initialCapital: 100000,
    riskPerTradePct: rpt,
    tradeDir: 'Both',
    psarStart,
    psarStep,
    psarMax,
    smaLength,
    slLookback: 2,
    rrRatio,
    orbTimeframeMinutes: 5,
    orbSlBodyPct: 0.70,
    orbRiskReward: rrRatio,
    stochKPeriod: 14,
    stochSmooth: 3,
    stochDPeriod: 3,
    stochOverbought: 80,
    stochOversold: 20,
    enableAtr: true,
    fixedSlPct: 1.2,
    fixedTpPct: rrRatio * 1.2,
    useTrailingStop: lower.includes('trailing'),
    slippagePoints: 1.0,
    brokeragePerOrder: 20,
    positionMode: 'BOTH',
  };

  const explanation = `Configured ${strategyType.replace('_', ' ')} strategy on ${symbol} (${timeframe.toUpperCase()}). Risk Per Trade: ${rpt}%, RR Target: 1:${rrRatio}, Indicator params: PSAR(${psarStart}, ${psarStep}, ${psarMax}), SMA(${smaLength}).`;

  return {
    promptText: prompt,
    symbol,
    timeframe,
    strategyType,
    params,
    explanation,
  };
}
