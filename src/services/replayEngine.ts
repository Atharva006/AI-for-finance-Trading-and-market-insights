import { Candle } from '../types/backtest';

export type ReplaySide = 'LONG' | 'SHORT';
export type ReplayExitReason = 'MANUAL' | 'STOP_LOSS' | 'TAKE_PROFIT';

export interface ReplayPosition {
  id: string;
  side: ReplaySide;
  entryPrice: number;
  entryIndex: number;
  entryTime: string;
  qty: number;
  stopLoss: number | null;
  takeProfit: number | null;
}

export interface ReplayClosedTrade {
  id: string;
  side: ReplaySide;
  entryPrice: number;
  entryIndex: number;
  entryTime: string;
  exitPrice: number;
  exitIndex: number;
  exitTime: string;
  qty: number;
  pnl: number;
  rMultiple: number | null;
  exitReason: ReplayExitReason;
  stopLoss: number | null;
  takeProfit: number | null;
}

export interface ReplayMetrics {
  balance: number;
  realizedPnl: number;
  unrealizedPnl: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  maxDrawdown: number;
  maxDrawdownPct: number;
}

export interface ReplayState {
  allCandles: Candle[];
  currentIndex: number;
  startIndex: number;
  isPlaying: boolean;
  playSpeed: number;
  initialBalance: number;
  balance: number;
  peakBalance: number;
  activePosition: ReplayPosition | null;
  closedTrades: ReplayClosedTrade[];
}

/**
 * Creates initial replay state with the provided candles, starting index, and balance.
 */
export function createInitialReplayState(
  candles: Candle[],
  startIndex: number = 0,
  initialBalance: number = 100000
): ReplayState {
  const boundedStartIndex = candles.length === 0
    ? 0
    : Math.max(0, Math.min(startIndex, candles.length - 1));

  return {
    allCandles: candles,
    currentIndex: boundedStartIndex,
    startIndex: boundedStartIndex,
    isPlaying: false,
    playSpeed: 1,
    initialBalance,
    balance: initialBalance,
    peakBalance: initialBalance,
    activePosition: null,
    closedTrades: [],
  };
}

/**
 * Increments currentIndex by 1 and evaluates active position against new candle's H/L for SL/TP.
 * Conservative tie-breaker: if both SL and TP are within candle range, assumes SL hit first.
 */
export function stepForward(state: ReplayState): ReplayState {
  if (!state.allCandles || state.allCandles.length === 0) {
    return state;
  }

  if (state.currentIndex >= state.allCandles.length - 1) {
    return state.isPlaying ? { ...state, isPlaying: false } : state;
  }

  const nextIndex = state.currentIndex + 1;
  const candle = state.allCandles[nextIndex];

  if (!state.activePosition) {
    return {
      ...state,
      currentIndex: nextIndex,
    };
  }

  const position = state.activePosition;
  let slHit = false;
  let tpHit = false;

  if (position.side === 'LONG') {
    slHit = position.stopLoss !== null && candle.low <= position.stopLoss;
    tpHit = position.takeProfit !== null && candle.high >= position.takeProfit;
  } else {
    // SHORT
    slHit = position.stopLoss !== null && candle.high >= position.stopLoss;
    tpHit = position.takeProfit !== null && candle.low <= position.takeProfit;
  }

  // Position remains open if neither SL nor TP was hit
  if (!slHit && !tpHit) {
    return {
      ...state,
      currentIndex: nextIndex,
    };
  }

  // Conservative tie-breaker: if both hit on the same candle, assume SL hit first
  let exitReason: ReplayExitReason;
  let exitPrice: number;

  if (slHit && tpHit) {
    exitReason = 'STOP_LOSS';
    exitPrice = position.stopLoss!;
  } else if (slHit) {
    exitReason = 'STOP_LOSS';
    exitPrice = position.stopLoss!;
  } else {
    exitReason = 'TAKE_PROFIT';
    exitPrice = position.takeProfit!;
  }

  const grossPnl = position.side === 'LONG'
    ? (exitPrice - position.entryPrice) * position.qty
    : (position.entryPrice - exitPrice) * position.qty;
  const pnl = Number(grossPnl.toFixed(2));

  let rMultiple: number | null = null;
  if (position.stopLoss !== null) {
    const riskDistance = position.side === 'LONG'
      ? position.entryPrice - position.stopLoss
      : position.stopLoss - position.entryPrice;

    if (riskDistance > 0) {
      const r = position.side === 'LONG'
        ? (exitPrice - position.entryPrice) / riskDistance
        : (position.entryPrice - exitPrice) / riskDistance;
      rMultiple = Number(r.toFixed(2));
    }
  }

  const closedTrade: ReplayClosedTrade = {
    id: position.id,
    side: position.side,
    entryPrice: position.entryPrice,
    entryIndex: position.entryIndex,
    entryTime: position.entryTime,
    exitPrice,
    exitIndex: nextIndex,
    exitTime: candle.time,
    qty: position.qty,
    pnl,
    rMultiple,
    exitReason,
    stopLoss: position.stopLoss,
    takeProfit: position.takeProfit,
  };

  const newBalance = Number((state.balance + pnl).toFixed(2));
  const newPeakBalance = Math.max(state.peakBalance, newBalance);

  return {
    ...state,
    currentIndex: nextIndex,
    balance: newBalance,
    peakBalance: newPeakBalance,
    activePosition: null,
    closedTrades: [...state.closedTrades, closedTrade],
  };
}

/**
 * Decrements currentIndex by 1 and undoes the last trade if it exited on the candle being rewound.
 */
export function stepBackward(state: ReplayState): ReplayState {
  if (state.currentIndex <= 0) {
    return state;
  }

  const rewoundIndex = state.currentIndex;
  const prevIndex = rewoundIndex - 1;

  let activePosition = state.activePosition;
  let closedTrades = state.closedTrades;
  let balance = state.balance;

  const lastTrade = closedTrades.length > 0 ? closedTrades[closedTrades.length - 1] : null;

  if (lastTrade && lastTrade.exitIndex === rewoundIndex) {
    // Undo the trade that exited on the candle being rewound
    closedTrades = closedTrades.slice(0, -1);
    balance = Number((balance - lastTrade.pnl).toFixed(2));

    // Restore position if it was entered on or before the new currentIndex
    if (lastTrade.entryIndex <= prevIndex) {
      activePosition = {
        id: lastTrade.id,
        side: lastTrade.side,
        entryPrice: lastTrade.entryPrice,
        entryIndex: lastTrade.entryIndex,
        entryTime: lastTrade.entryTime,
        qty: lastTrade.qty,
        stopLoss: lastTrade.stopLoss,
        takeProfit: lastTrade.takeProfit,
      };
    } else {
      activePosition = null;
    }
  } else if (activePosition && activePosition.entryIndex === rewoundIndex) {
    // Position was opened on the candle being rewound; at prevIndex it doesn't exist
    activePosition = null;
  }

  // Recalculate peak balance for the remaining closed trades
  let peakBalance = state.initialBalance;
  let running = state.initialBalance;
  for (const t of closedTrades) {
    running = Number((running + t.pnl).toFixed(2));
    if (running > peakBalance) {
      peakBalance = running;
    }
  }

  return {
    ...state,
    currentIndex: prevIndex,
    balance,
    peakBalance,
    activePosition,
    closedTrades,
  };
}

/**
 * Opens a new position at allCandles[currentIndex].close, only if there is no active position.
 */
export function openPosition(
  state: ReplayState,
  side: ReplaySide,
  qty: number,
  sl: number | null = null,
  tp: number | null = null
): ReplayState {
  if (state.activePosition !== null) {
    return state;
  }

  if (
    !state.allCandles ||
    state.allCandles.length === 0 ||
    state.currentIndex < 0 ||
    state.currentIndex >= state.allCandles.length ||
    qty <= 0
  ) {
    return state;
  }

  const candle = state.allCandles[state.currentIndex];
  const entryPrice = candle.close;
  const entryIndex = state.currentIndex;
  const entryTime = candle.time;

  const newPosition: ReplayPosition = {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `pos-${state.currentIndex}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    side,
    entryPrice,
    entryIndex,
    entryTime,
    qty,
    stopLoss: sl !== undefined ? sl : null,
    takeProfit: tp !== undefined ? tp : null,
  };

  return {
    ...state,
    activePosition: newPosition,
  };
}

/**
 * Manually closes the active position at allCandles[currentIndex].close.
 */
export function closePosition(state: ReplayState): ReplayState {
  if (
    !state.activePosition ||
    !state.allCandles ||
    state.allCandles.length === 0 ||
    state.currentIndex < 0 ||
    state.currentIndex >= state.allCandles.length
  ) {
    return state;
  }

  const position = state.activePosition;
  const candle = state.allCandles[state.currentIndex];
  const exitPrice = candle.close;
  const exitIndex = state.currentIndex;
  const exitTime = candle.time;
  const exitReason: ReplayExitReason = 'MANUAL';

  const grossPnl = position.side === 'LONG'
    ? (exitPrice - position.entryPrice) * position.qty
    : (position.entryPrice - exitPrice) * position.qty;
  const pnl = Number(grossPnl.toFixed(2));

  let rMultiple: number | null = null;
  if (position.stopLoss !== null) {
    const riskDistance = position.side === 'LONG'
      ? position.entryPrice - position.stopLoss
      : position.stopLoss - position.entryPrice;

    if (riskDistance > 0) {
      const r = position.side === 'LONG'
        ? (exitPrice - position.entryPrice) / riskDistance
        : (position.entryPrice - exitPrice) / riskDistance;
      rMultiple = Number(r.toFixed(2));
    }
  }

  const closedTrade: ReplayClosedTrade = {
    id: position.id,
    side: position.side,
    entryPrice: position.entryPrice,
    entryIndex: position.entryIndex,
    entryTime: position.entryTime,
    exitPrice,
    exitIndex,
    exitTime,
    qty: position.qty,
    pnl,
    rMultiple,
    exitReason,
    stopLoss: position.stopLoss,
    takeProfit: position.takeProfit,
  };

  const newBalance = Number((state.balance + pnl).toFixed(2));
  const newPeakBalance = Math.max(state.peakBalance, newBalance);

  return {
    ...state,
    balance: newBalance,
    peakBalance: newPeakBalance,
    activePosition: null,
    closedTrades: [...state.closedTrades, closedTrade],
  };
}

/**
 * Computes institutional performance metrics for the replay session.
 */
export function computeMetrics(state: ReplayState): ReplayMetrics {
  const totalTrades = state.closedTrades.length;
  const realizedPnl = Number(
    state.closedTrades.reduce((acc, t) => acc + t.pnl, 0).toFixed(2)
  );

  let unrealizedPnl = 0;
  if (
    state.activePosition &&
    state.allCandles &&
    state.currentIndex >= 0 &&
    state.currentIndex < state.allCandles.length
  ) {
    const pos = state.activePosition;
    const currentPrice = state.allCandles[state.currentIndex].close;
    const unrealized = pos.side === 'LONG'
      ? (currentPrice - pos.entryPrice) * pos.qty
      : (pos.entryPrice - currentPrice) * pos.qty;
    unrealizedPnl = Number(unrealized.toFixed(2));
  }

  const winningTrades = state.closedTrades.filter((t) => t.pnl > 0);
  const losingTrades = state.closedTrades.filter((t) => t.pnl < 0);

  const winRate = totalTrades > 0
    ? Number(((winningTrades.length / totalTrades) * 100).toFixed(2))
    : 0;

  const grossProfit = winningTrades.reduce((acc, t) => acc + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0));

  let profitFactor = 0;
  if (grossLoss > 0) {
    profitFactor = Number((grossProfit / grossLoss).toFixed(2));
  } else if (grossProfit > 0) {
    profitFactor = 99.9;
  } else {
    profitFactor = 0;
  }

  // Calculate maximum drawdown from equity curve
  let peak = state.initialBalance;
  let maxDrawdown = 0;
  let maxDrawdownPct = 0;
  let runningEquity = state.initialBalance;

  for (const trade of state.closedTrades) {
    runningEquity = Number((runningEquity + trade.pnl).toFixed(2));
    if (runningEquity > peak) {
      peak = runningEquity;
    }
    const dd = peak - runningEquity;
    const ddPct = peak > 0 ? (dd / peak) * 100 : 0;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }
    if (ddPct > maxDrawdownPct) {
      maxDrawdownPct = ddPct;
    }
  }

  // Factor in open position unrealized PnL at the current bar
  if (state.activePosition && unrealizedPnl !== 0) {
    const currentEquity = Number((state.balance + unrealizedPnl).toFixed(2));
    const currentPeak = Math.max(peak, currentEquity);
    const dd = currentPeak - currentEquity;
    const ddPct = currentPeak > 0 ? (dd / currentPeak) * 100 : 0;
    if (dd > maxDrawdown) {
      maxDrawdown = dd;
    }
    if (ddPct > maxDrawdownPct) {
      maxDrawdownPct = ddPct;
    }
  }

  return {
    balance: state.balance,
    realizedPnl,
    unrealizedPnl,
    winRate,
    profitFactor,
    totalTrades,
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
  };
}

/**
 * Exports closed trades to a standard CSV string.
 */
export function exportTradesToCSV(trades: ReplayClosedTrade[]): string {
  const headers = [
    'id',
    'side',
    'entryPrice',
    'entryIndex',
    'entryTime',
    'exitPrice',
    'exitIndex',
    'exitTime',
    'qty',
    'pnl',
    'rMultiple',
    'exitReason',
    'stopLoss',
    'takeProfit',
  ];

  if (!trades || trades.length === 0) {
    return headers.join(',');
  }

  const formatField = (val: unknown): string => {
    if (val === null || val === undefined) {
      return '';
    }
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = trades.map((t) => [
    formatField(t.id),
    formatField(t.side),
    formatField(t.entryPrice),
    formatField(t.entryIndex),
    formatField(t.entryTime),
    formatField(t.exitPrice),
    formatField(t.exitIndex),
    formatField(t.exitTime),
    formatField(t.qty),
    formatField(t.pnl),
    formatField(t.rMultiple),
    formatField(t.exitReason),
    formatField(t.stopLoss),
    formatField(t.takeProfit),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}
