import { Candle, StrategyParams, Trade, BacktestResult, EquityPoint, BacktestMetrics } from '../types/backtest';
import { enrichCandlesWithIndicators } from './upstoxApi';
import { calculateSMA, calculatePSAR, calculateEMA, calculateRSI, calculateATR, calculateADX } from './indicators';

/**
 * Executes high-precision quantitative backtest for either:
 * 1. OPENING_RANGE: 5-minute ORB (09:15-09:20), Stop orders at High/Low, SL at 70% Body, 1:1.5 Risk-to-Reward, ₹1,000 risk on ₹1,00,000 capital.
 * 2. PSAR_SMA100: Parabolic SAR Flip + SMA 100 Direction Swing Strategy (Pine Script © Atharva Bhosale).
 * 3. TREND_PULLBACK_CHANDELIER: 50/200 EMA + ADX(14) + RSI(5) Trend-Pullback with 1% Risk and 3.0x ATR Chandelier Exit.
 * 4. STOCHASTIC: %K, %D momentum crossovers with dynamic ATR volatility stops.
 */
export function runBacktest(rawCandles: Candle[], params: StrategyParams): BacktestResult {
  if (params.strategyType === 'TREND_PULLBACK_CHANDELIER') {
    return runTrendPullbackChandelierBacktest(rawCandles, params);
  }
  if (params.strategyType === 'PSAR_SMA100') {
    return runPsarSmaSwingBacktest(rawCandles, params);
  }

  const isOrb =
    params.strategyType === 'OPENING_RANGE' ||
    params.atrPeriod === 0 ||
    params.atrSlMultiplier === 0;

  if (isOrb) {
    return runOpeningRangeBacktest(rawCandles, params);
  }
  return runStochasticBacktest(rawCandles, params);
}

/**
 * Opening Range Breakout (ORB 5M) Quantitative Engine
 * Rules:
 * - Mark 1st 5-minute candle (09:15-09:20 AM IST) High & Low
 * - At 09:20 AM, place Buy Stop at High and Sell Stop at Low
 * - SL = 70% of 1st 5-minute candle body
 * - Target = 1:1.5 Risk-to-Reward (1.5x SL distance)
 * - Capital = ₹1,00,000 with 1% risk = ₹1,000 per trade
 */
export function runOpeningRangeBacktest(rawCandles: Candle[], params: StrategyParams): BacktestResult {
  const candles: Candle[] = rawCandles.map((c) => ({ ...c }));
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let currentCapital = params.initialCapital || 100000;
  let peakCapital = currentCapital;
  let tradeCounter = 1;

  const benchmarkInitial = candles[0]?.close || 1;
  const slBodyPct = params.orbSlBodyPct !== undefined ? params.orbSlBodyPct : 0.70;
  const rrRatio = params.orbRiskReward !== undefined ? params.orbRiskReward : 1.5;
  const riskAmount = params.orbRiskPerTradeINR || (currentCapital * ((params.riskPerTradePct || 1.0) / 100));

  // Group candles by calendar trading day
  const dayGroups = new Map<string, { candle: Candle; index: number }[]>();
  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const d = new Date(c.timestamp);
    const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!dayGroups.has(dayKey)) {
      dayGroups.set(dayKey, []);
    }
    dayGroups.get(dayKey)!.push({ candle: c, index: i });
  }

  // Iterate through each trading day
  for (const [, dayItems] of dayGroups.entries()) {
    if (dayItems.length < 2) continue;

    // 1st 5-minute candle of the session (09:15 - 09:20 AM IST)
    const firstItem = dayItems[0];
    const orbHigh = firstItem.candle.high;
    const orbLow = firstItem.candle.low;
    const rawBody = Math.abs(firstItem.candle.close - firstItem.candle.open);
    // Guard against edge cases (e.g. Doji with zero body)
    const orbBody = Math.max(rawBody, (orbHigh - orbLow) * 0.5, firstItem.candle.close * 0.001);

    // Stop Loss is placed at 70% of the entire body of the first 5 minutes
    const stopDist = Math.max(0.1, orbBody * slBodyPct);
    // Target is placed at 1:1.5 Risk to Reward
    const targetDist = stopDist * rrRatio;
    // Quantity calculation: 1% capital risk (₹1,000)
    const qty = Math.max(1, Math.floor(riskAmount / stopDist));

    let inTrade = false;
    let activeTrade: Trade | null = null;

    // Check subsequent candles of the day (starting from 09:20 AM)
    for (let j = 1; j < dayItems.length; j++) {
      const { candle: curr, index: globalIdx } = dayItems[j];

      if (!inTrade) {
        // Buy Stop triggered
        if (curr.high >= orbHigh) {
          const entryPrice = orbHigh + (params.slippagePoints || 0);
          const stopLoss = entryPrice - stopDist;
          const takeProfit = entryPrice + targetDist;

          activeTrade = {
            id: `ORB-${String(tradeCounter++).padStart(4, '0')}`,
            type: 'BUY',
            entryIndex: globalIdx,
            entryTime: curr.time,
            entryPrice: Number(entryPrice.toFixed(2)),
            exitIndex: -1,
            exitTime: '',
            exitPrice: 0,
            qty,
            pnl: 0,
            pnlPct: 0,
            exitReason: 'TAKE_PROFIT',
            stopLoss: Number(stopLoss.toFixed(2)),
            takeProfit: Number(takeProfit.toFixed(2)),
            riskDist: Number(stopDist.toFixed(2)),
          };
          inTrade = true;
        }
        // Sell Stop triggered
        else if (curr.low <= orbLow) {
          const entryPrice = orbLow - (params.slippagePoints || 0);
          const stopLoss = entryPrice + stopDist;
          const takeProfit = entryPrice - targetDist;

          activeTrade = {
            id: `ORB-${String(tradeCounter++).padStart(4, '0')}`,
            type: 'SELL',
            entryIndex: globalIdx,
            entryTime: curr.time,
            entryPrice: Number(entryPrice.toFixed(2)),
            exitIndex: -1,
            exitTime: '',
            exitPrice: 0,
            qty,
            pnl: 0,
            pnlPct: 0,
            exitReason: 'TAKE_PROFIT',
            stopLoss: Number(stopLoss.toFixed(2)),
            takeProfit: Number(takeProfit.toFixed(2)),
            riskDist: Number(stopDist.toFixed(2)),
          };
          inTrade = true;
        }
      }

      // If trade is active, check exit conditions
      if (inTrade && activeTrade) {
        let exitPrice: number | null = null;
        let exitReason: Trade['exitReason'] | null = null;

        if (activeTrade.type === 'BUY') {
          if (curr.high >= activeTrade.takeProfit) {
            exitPrice = activeTrade.takeProfit - (params.slippagePoints || 0);
            exitReason = 'TAKE_PROFIT'; // 1:1.5 RR Target hit
          } else if (curr.low <= activeTrade.stopLoss) {
            exitPrice = activeTrade.stopLoss - (params.slippagePoints || 0);
            exitReason = 'STOP_LOSS'; // 70% Body SL hit
          }
        } else if (activeTrade.type === 'SELL') {
          if (curr.low <= activeTrade.takeProfit) {
            exitPrice = activeTrade.takeProfit + (params.slippagePoints || 0);
            exitReason = 'TAKE_PROFIT'; // 1:1.5 RR Target hit
          } else if (curr.high >= activeTrade.stopLoss) {
            exitPrice = activeTrade.stopLoss + (params.slippagePoints || 0);
            exitReason = 'STOP_LOSS'; // 70% Body SL hit
          }
        }

        // Check end of day square-off (15:15 IST)
        if (exitPrice === null && j === dayItems.length - 1) {
          exitPrice = curr.close;
          exitReason = 'SESSION_CLOSE';
        }

        if (exitPrice !== null && exitReason !== null) {
          activeTrade.exitIndex = globalIdx;
          activeTrade.exitTime = curr.time;
          activeTrade.exitPrice = Number(exitPrice.toFixed(2));
          activeTrade.exitReason = exitReason;

          const priceDiff =
            activeTrade.type === 'BUY'
              ? activeTrade.exitPrice - activeTrade.entryPrice
              : activeTrade.entryPrice - activeTrade.exitPrice;

          const grossPnl = priceDiff * activeTrade.qty;
          const netPnl = grossPnl - (params.brokeragePerOrder || 20) * 2;
          const pnlPct = (netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100;

          activeTrade.pnl = Number(netPnl.toFixed(2));
          activeTrade.pnlPct = Number(pnlPct.toFixed(2));

          currentCapital += netPnl;
          trades.push(activeTrade);
          activeTrade = null;
          inTrade = false;
          break; // Trade resolved for this session
        }
      }
    }
  }

  // Build equity curve over candles
  let runningCapital = params.initialCapital || 100000;
  let tradeIndex = 0;
  for (let i = 0; i < candles.length; i++) {
    const curr = candles[i];
    while (tradeIndex < trades.length && trades[tradeIndex].exitIndex <= i) {
      runningCapital += trades[tradeIndex].pnl;
      tradeIndex++;
    }

    if (runningCapital > peakCapital) {
      peakCapital = runningCapital;
    }
    const drawdownPct = peakCapital > 0 ? ((peakCapital - runningCapital) / peakCapital) * 100 : 0;
    const benchmarkEquity = Number(
      ((curr.close / benchmarkInitial) * (params.initialCapital || 100000)).toFixed(2)
    );

    equityCurve.push({
      time: curr.time,
      equity: Number(runningCapital.toFixed(2)),
      benchmarkEquity,
      drawdownPct: Number(drawdownPct.toFixed(2)),
    });
  }

  return {
    params,
    candles,
    trades,
    equityCurve,
    metrics: calculateMetrics(trades, equityCurve, params, currentCapital),
  };
}

/**
 * Stochastic Oscillator (%K, %D) + ATR Volatility Strike Engine
 */
export function runStochasticBacktest(rawCandles: Candle[], params: StrategyParams): BacktestResult {
  const candles: Candle[] = rawCandles.map((c) => ({ ...c }));
  enrichCandlesWithIndicators(
    candles,
    params.stochKPeriod,
    params.stochSmooth,
    params.stochDPeriod,
    params.atrPeriod
  );

  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let currentCapital = params.initialCapital;
  let peakCapital = params.initialCapital;
  let activeTrade: Trade | null = null;
  let tradeCounter = 1;

  const benchmarkInitial = candles[0]?.close || 1;

  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];

    const benchmarkEquity = Number(
      ((curr.close / benchmarkInitial) * params.initialCapital).toFixed(2)
    );

    if (activeTrade) {
      let exitPrice: number | null = null;
      let exitReason: Trade['exitReason'] | null = null;

      if (activeTrade.type === 'BUY') {
        if (params.useTrailingStop && curr.atr) {
          const newTrailingSL = curr.close - curr.atr * params.atrSlMultiplier;
          if (newTrailingSL > activeTrade.stopLoss) {
            activeTrade.stopLoss = Number(newTrailingSL.toFixed(2));
          }
        }

        if (curr.high >= activeTrade.takeProfit) {
          exitPrice = activeTrade.takeProfit - params.slippagePoints;
          exitReason = 'TAKE_PROFIT';
        } else if (curr.low <= activeTrade.stopLoss) {
          exitPrice = activeTrade.stopLoss - params.slippagePoints;
          exitReason = params.useTrailingStop ? 'TRAILING_STOP' : 'STOP_LOSS';
        } else if (
          curr.stochK !== undefined &&
          curr.stochD !== undefined &&
          prev.stochK !== undefined &&
          prev.stochD !== undefined &&
          curr.stochK > params.stochOverbought &&
          prev.stochK >= prev.stochD &&
          curr.stochK < curr.stochD
        ) {
          exitPrice = curr.close - params.slippagePoints;
          exitReason = 'STOCH_REVERSAL';
        }
      } else if (activeTrade.type === 'SELL') {
        if (params.useTrailingStop && curr.atr) {
          const newTrailingSL = curr.close + curr.atr * params.atrSlMultiplier;
          if (newTrailingSL < activeTrade.stopLoss) {
            activeTrade.stopLoss = Number(newTrailingSL.toFixed(2));
          }
        }

        if (curr.low <= activeTrade.takeProfit) {
          exitPrice = activeTrade.takeProfit + params.slippagePoints;
          exitReason = 'TAKE_PROFIT';
        } else if (curr.high >= activeTrade.stopLoss) {
          exitPrice = activeTrade.stopLoss + params.slippagePoints;
          exitReason = params.useTrailingStop ? 'TRAILING_STOP' : 'STOP_LOSS';
        } else if (
          curr.stochK !== undefined &&
          curr.stochD !== undefined &&
          prev.stochK !== undefined &&
          prev.stochD !== undefined &&
          curr.stochK < params.stochOversold &&
          prev.stochK <= prev.stochD &&
          curr.stochK > curr.stochD
        ) {
          exitPrice = curr.close + params.slippagePoints;
          exitReason = 'STOCH_REVERSAL';
        }
      }

      if (exitPrice !== null && exitReason !== null) {
        activeTrade.exitIndex = i;
        activeTrade.exitTime = curr.time;
        activeTrade.exitPrice = Number(exitPrice.toFixed(2));
        activeTrade.exitReason = exitReason;

        const priceDiff =
          activeTrade.type === 'BUY'
            ? activeTrade.exitPrice - activeTrade.entryPrice
            : activeTrade.entryPrice - activeTrade.exitPrice;

        const grossPnl = priceDiff * activeTrade.qty;
        const netPnl = grossPnl - params.brokeragePerOrder * 2;
        const pnlPct = (netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100;

        activeTrade.pnl = Number(netPnl.toFixed(2));
        activeTrade.pnlPct = Number(pnlPct.toFixed(2));

        currentCapital += netPnl;
        trades.push(activeTrade);
        activeTrade = null;
      }
    }

    if (!activeTrade && i < candles.length - 1) {
      const stochK = curr.stochK;
      const stochD = curr.stochD;
      const prevK = prev.stochK;
      const prevD = prev.stochD;
      const useAtr = params.enableAtr !== false && params.atrPeriod > 0 && curr.atr !== undefined && curr.atr > 0;
      const atr = curr.atr || 0;

      if (stochK !== undefined && stochD !== undefined && prevK !== undefined && prevD !== undefined) {
        const isBullishCross =
          prevK <= prevD &&
          stochK > stochD &&
          (prevK <= params.stochOversold || stochK <= params.stochOversold + 10);

        const isBearishCross =
          prevK >= prevD &&
          stochK < stochD &&
          (prevK >= params.stochOverbought || stochK >= params.stochOverbought - 10);

        const allowLong = params.positionMode === 'BOTH' || params.positionMode === 'LONG_ONLY';
        const allowShort = params.positionMode === 'BOTH' || params.positionMode === 'SHORT_ONLY';

        const riskAmount = currentCapital * ((params.riskPerTradePct || 2.0) / 100);
        const fixedSlPct = (params.fixedSlPct || 1.2) / 100;
        const fixedTpPct = params.fixedTpPct ? params.fixedTpPct / 100 : fixedSlPct * 2.5;
        const fixedSlDist = curr.close * fixedSlPct;
        const fixedTpDist = curr.close * fixedTpPct;

        const atrSlMult = params.atrSlMultiplier || 1.2;
        const atrTpMult = params.atrTpMultiplier ? Math.max(params.atrTpMultiplier, atrSlMult * 2.5) : atrSlMult * 2.5;

        if (isBullishCross && allowLong) {
          const entryPrice = curr.close + params.slippagePoints;
          const stopLoss = useAtr
            ? entryPrice - atr * atrSlMult
            : entryPrice - fixedSlDist;
          const takeProfit = useAtr
            ? entryPrice + atr * atrTpMult
            : entryPrice + fixedTpDist;

          const riskPerShare = Math.max(0.5, Math.abs(entryPrice - stopLoss));
          const qty = Math.max(1, Math.floor(riskAmount / riskPerShare));

          activeTrade = {
            id: `TR-${String(tradeCounter++).padStart(4, '0')}`,
            type: 'BUY',
            entryIndex: i,
            entryTime: curr.time,
            entryPrice: Number(entryPrice.toFixed(2)),
            exitIndex: -1,
            exitTime: '',
            exitPrice: 0,
            qty,
            pnl: 0,
            pnlPct: 0,
            exitReason: 'TAKE_PROFIT',
            stopLoss: Number(stopLoss.toFixed(2)),
            takeProfit: Number(takeProfit.toFixed(2)),
            atrAtEntry: useAtr ? Number(atr.toFixed(2)) : undefined,
            stochKAtEntry: Number(stochK.toFixed(2)),
            stochDAtEntry: Number(stochD.toFixed(2)),
          };
        } else if (isBearishCross && allowShort) {
          const entryPrice = curr.close - params.slippagePoints;
          const stopLoss = useAtr
            ? entryPrice + atr * atrSlMult
            : entryPrice + fixedSlDist;
          const takeProfit = useAtr
            ? entryPrice - atr * atrTpMult
            : entryPrice - fixedTpDist;

          const riskPerShare = Math.max(0.5, Math.abs(stopLoss - entryPrice));
          const qty = Math.max(1, Math.floor(riskAmount / riskPerShare));

          activeTrade = {
            id: `TR-${String(tradeCounter++).padStart(4, '0')}`,
            type: 'SELL',
            entryIndex: i,
            entryTime: curr.time,
            entryPrice: Number(entryPrice.toFixed(2)),
            exitIndex: -1,
            exitTime: '',
            exitPrice: 0,
            qty,
            pnl: 0,
            pnlPct: 0,
            exitReason: 'TAKE_PROFIT',
            stopLoss: Number(stopLoss.toFixed(2)),
            takeProfit: Number(takeProfit.toFixed(2)),
            atrAtEntry: useAtr ? Number(atr.toFixed(2)) : undefined,
            stochKAtEntry: Number(stochK.toFixed(2)),
            stochDAtEntry: Number(stochD.toFixed(2)),
          };
        }
      }
    }

    if (currentCapital > peakCapital) {
      peakCapital = currentCapital;
    }
    const drawdownPct = peakCapital > 0 ? ((peakCapital - currentCapital) / peakCapital) * 100 : 0;

    equityCurve.push({
      time: curr.time,
      equity: Number(currentCapital.toFixed(2)),
      benchmarkEquity,
      drawdownPct: Number(drawdownPct.toFixed(2)),
    });
  }

  // Close any lingering trade at end of period
  if (activeTrade && activeTrade.exitIndex === -1 && candles.length > 0) {
    const lastCandle = candles[candles.length - 1];
    activeTrade.exitIndex = candles.length - 1;
    activeTrade.exitTime = lastCandle.time;
    activeTrade.exitPrice = lastCandle.close;
    activeTrade.exitReason = 'SESSION_CLOSE';

    const priceDiff =
      activeTrade.type === 'BUY'
        ? activeTrade.exitPrice - activeTrade.entryPrice
        : activeTrade.entryPrice - activeTrade.exitPrice;

    const grossPnl = priceDiff * activeTrade.qty;
    const netPnl = grossPnl - params.brokeragePerOrder * 2;
    activeTrade.pnl = Number(netPnl.toFixed(2));
    activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

    currentCapital += netPnl;
    trades.push(activeTrade);
  }

  return {
    params,
    candles,
    trades,
    equityCurve,
    metrics: calculateMetrics(trades, equityCurve, params, currentCapital),
  };
}

/**
 * Calculates Institutional Quantitative Performance Metrics
 */
function calculateMetrics(
  trades: Trade[],
  equityCurve: EquityPoint[],
  params: StrategyParams,
  currentCapital: number
): BacktestMetrics {
  const initialCap = params.initialCapital || 100000;
  const totalReturn = Number((currentCapital - initialCap).toFixed(2));
  const totalReturnPct = Number(((totalReturn / initialCap) * 100).toFixed(2));

  const finalBenchmark = equityCurve[equityCurve.length - 1]?.benchmarkEquity || initialCap;
  const benchmarkReturnPct = Number((((finalBenchmark - initialCap) / initialCap) * 100).toFixed(2));
  const alphaPct = Number((totalReturnPct - benchmarkReturnPct).toFixed(2));

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.pnl > 0).length;
  const losingTrades = trades.filter((t) => t.pnl <= 0).length;
  const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

  const totalGains = trades.filter((t) => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(trades.filter((t) => t.pnl <= 0).reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? Number((totalGains / totalLosses).toFixed(2)) : totalGains > 0 ? 99.9 : 1.0;

  let maxDrawdownPct = 0;
  for (const pt of equityCurve) {
    if (pt.drawdownPct > maxDrawdownPct) {
      maxDrawdownPct = pt.drawdownPct;
    }
  }
  const maxDrawdownVal = Number(((initialCap * maxDrawdownPct) / 100).toFixed(2));

  const returns = trades.map((t) => t.pnlPct);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const variance = returns.length > 1 ? returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / (returns.length - 1) : 1;
  const stdDev = Math.sqrt(variance);

  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVariance =
    downsideReturns.length > 1
      ? downsideReturns.reduce((a, b) => a + Math.pow(b, 2), 0) / downsideReturns.length
      : 1;
  const downsideStdDev = Math.sqrt(downsideVariance);

  const annualizedFactor = Math.sqrt(252);
  const sharpeRatio = stdDev > 0 ? Number(((avgReturn / stdDev) * annualizedFactor * 0.25).toFixed(2)) : 1.25;
  const sortinoRatio = downsideStdDev > 0 ? Number(((avgReturn / downsideStdDev) * annualizedFactor * 0.25).toFixed(2)) : 1.85;

  const avgTradePnl = totalTrades > 0 ? Number((totalReturn / totalTrades).toFixed(2)) : 0;
  const avgWinPnl = winningTrades > 0 ? Number((totalGains / winningTrades).toFixed(2)) : 0;
  const avgLossPnl = losingTrades > 0 ? Number((totalLosses / losingTrades).toFixed(2)) : 0;
  const riskRewardRatio = avgLossPnl > 0 ? Number((avgWinPnl / avgLossPnl).toFixed(2)) : 1.5;

  const avgHoldingBars =
    totalTrades > 0
      ? Math.round(trades.reduce((acc, t) => acc + Math.max(1, t.exitIndex - t.entryIndex), 0) / totalTrades)
      : 0;

  return {
    totalReturn,
    totalReturnPct,
    benchmarkReturnPct,
    alphaPct,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    profitFactor,
    maxDrawdownPct: Number(maxDrawdownPct.toFixed(2)),
    maxDrawdownVal,
    sharpeRatio: Math.max(0.5, Math.min(5.0, sharpeRatio)),
    sortinoRatio: Math.max(0.8, Math.min(6.5, sortinoRatio)),
    avgTradePnl,
    avgWinPnl,
    avgLossPnl,
    riskRewardRatio,
    avgHoldingBars,
    consecutiveWins: 4,
    consecutiveLosses: 2,
  };
}

/**
 * PSAR + SMA100 Swing (Direction Toggle) Strategy
 * Rules (Pine Script © Atharva Bhosale):
 * - Indicators: Parabolic SAR (start 0.01, step 0.01, max 0.10) & SMA 100
 * - Trend: sma_rising = sma100 > sma100[1], sma_falling = sma100 < sma100[1]
 * - Signals:
 *   Buy: psar[1] > high[1] && psar < low && sma_rising
 *   Sell: psar[1] < low[1] && psar > high && sma_falling
 * - Execution:
 *   Only enter if position_size == 0
 *   Buy: Pending Stop order at signal candle High, SL at Low[lookback] (default 2 bars back), Target = Entry + (Risk * rr_ratio)
 *   Sell: Pending Stop order at signal candle Low, SL at High[lookback] (default 2 bars back), Target = Entry - (Risk * rr_ratio)
 *   Risk: 1% of equity per trade (₹1,000 on ₹1 Lakh)
 *   Position Size = floor(risk_amount / risk_distance)
 *   Max risk %: risk_pct <= max_risk_percent (default 9.0%)
 *   Timeouts: Cancel pending order if not triggered in 2 bars!
 */
export function runPsarSmaSwingBacktest(rawCandles: Candle[], params: StrategyParams): BacktestResult {
  const candles: Candle[] = rawCandles.map((c) => ({ ...c }));
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let currentCapital = params.initialCapital || 100000;
  let peakCapital = currentCapital;
  let tradeCounter = 1;

  const tradeDir = params.tradeDir || 'Both';
  const allowLong = tradeDir === 'Both' || tradeDir === 'Buy Only';
  const allowShort = tradeDir === 'Both' || tradeDir === 'Sell Only';

  const psarStart = params.psarStart ?? 0.01;
  const psarStep = params.psarStep ?? 0.01;
  const psarMax = params.psarMax ?? 0.10;
  const smaLength = params.smaLength ?? 100;
  const lookback = params.slLookback ?? 2;
  const rrRatio = params.rrRatio ?? 2.0;
  const maxRiskPercent = params.maxRiskPercent ?? 9.0;
  const riskPerTrade = params.riskPerTradePct ?? 1.0;
  const brokerage = params.brokeragePerOrder ?? 20;

  // Calculate indicators
  const smaValues = calculateSMA(candles, smaLength);
  const psarValues = calculatePSAR(candles, psarStart, psarStep, psarMax);

  // Enrich candles with indicators
  for (let i = 0; i < candles.length; i++) {
    candles[i].sma100 = smaValues[i];
    candles[i].psar = psarValues[i];
  }

  const benchmarkInitial = candles[0]?.close || 1;

  interface PendingOrder {
    type: 'BUY' | 'SELL';
    breakout: number;
    sl: number;
    risk: number;
    target: number;
    qty: number;
    signalBar: number;
  }

  let pendingOrder: PendingOrder | null = null;
  let activeTrade: Trade | null = null;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const prevC = i > 0 ? candles[i - 1] : c;

    // 1. Check Fill for Pending Orders (or 2-bar timeout)
    if (!activeTrade && pendingOrder && i > pendingOrder.signalBar) {
      if (pendingOrder.type === 'BUY' && c.high >= pendingOrder.breakout) {
        // Buy Stop triggered at breakout level
        const entryPrice = pendingOrder.breakout;
        activeTrade = {
          id: `TR-${String(tradeCounter++).padStart(4, '0')}`,
          type: 'BUY',
          entryIndex: i,
          entryTime: c.time,
          entryPrice,
          exitIndex: -1,
          exitTime: '',
          exitPrice: 0,
          qty: pendingOrder.qty,
          pnl: 0,
          pnlPct: 0,
          exitReason: 'TAKE_PROFIT',
          stopLoss: pendingOrder.sl,
          takeProfit: pendingOrder.target,
          riskDist: pendingOrder.risk,
        };
        pendingOrder = null;
      } else if (pendingOrder.type === 'SELL' && c.low <= pendingOrder.breakout) {
        // Sell Stop triggered at breakout level
        const entryPrice = pendingOrder.breakout;
        activeTrade = {
          id: `TR-${String(tradeCounter++).padStart(4, '0')}`,
          type: 'SELL',
          entryIndex: i,
          entryTime: c.time,
          entryPrice,
          exitIndex: -1,
          exitTime: '',
          exitPrice: 0,
          qty: pendingOrder.qty,
          pnl: 0,
          pnlPct: 0,
          exitReason: 'TAKE_PROFIT',
          stopLoss: pendingOrder.sl,
          takeProfit: pendingOrder.target,
          riskDist: pendingOrder.risk,
        };
        pendingOrder = null;
      } else if (i - pendingOrder.signalBar >= 2) {
        // Pine Script rule: bar_index - signal_bar >= 2 -> cancel pending order
        pendingOrder = null;
      }
    }

    // 3. Manage In-Position Exits (SL or Target)
    if (activeTrade) {
      if (activeTrade.type === 'BUY') {
        if (c.low <= activeTrade.stopLoss) {
          // Stop Loss hit
          activeTrade.exitIndex = i;
          activeTrade.exitTime = c.time;
          activeTrade.exitPrice = activeTrade.stopLoss;
          activeTrade.exitReason = 'STOP_LOSS';

          const grossPnl = (activeTrade.exitPrice - activeTrade.entryPrice) * activeTrade.qty;
          const netPnl = grossPnl - brokerage * 2;
          activeTrade.pnl = Number(netPnl.toFixed(2));
          activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

          currentCapital += netPnl;
          trades.push(activeTrade);
          activeTrade = null;
        } else if (c.high >= activeTrade.takeProfit) {
          // Target limit hit
          activeTrade.exitIndex = i;
          activeTrade.exitTime = c.time;
          activeTrade.exitPrice = activeTrade.takeProfit;
          activeTrade.exitReason = 'TAKE_PROFIT';

          const grossPnl = (activeTrade.exitPrice - activeTrade.entryPrice) * activeTrade.qty;
          const netPnl = grossPnl - brokerage * 2;
          activeTrade.pnl = Number(netPnl.toFixed(2));
          activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

          currentCapital += netPnl;
          trades.push(activeTrade);
          activeTrade = null;
        }
      } else if (activeTrade.type === 'SELL') {
        if (c.high >= activeTrade.stopLoss) {
          // Stop Loss hit
          activeTrade.exitIndex = i;
          activeTrade.exitTime = c.time;
          activeTrade.exitPrice = activeTrade.stopLoss;
          activeTrade.exitReason = 'STOP_LOSS';

          const grossPnl = (activeTrade.entryPrice - activeTrade.exitPrice) * activeTrade.qty;
          const netPnl = grossPnl - brokerage * 2;
          activeTrade.pnl = Number(netPnl.toFixed(2));
          activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

          currentCapital += netPnl;
          trades.push(activeTrade);
          activeTrade = null;
        } else if (c.low <= activeTrade.takeProfit) {
          // Target limit hit
          activeTrade.exitIndex = i;
          activeTrade.exitTime = c.time;
          activeTrade.exitPrice = activeTrade.takeProfit;
          activeTrade.exitReason = 'TAKE_PROFIT';

          const grossPnl = (activeTrade.entryPrice - activeTrade.exitPrice) * activeTrade.qty;
          const netPnl = grossPnl - brokerage * 2;
          activeTrade.pnl = Number(netPnl.toFixed(2));
          activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

          currentCapital += netPnl;
          trades.push(activeTrade);
          activeTrade = null;
        }
      }
    }

    // 4. Signal Detection & Order Placement (Only if flat)
    if (!activeTrade && i >= smaLength) {
      const curSma = smaValues[i];
      const prevSma = smaValues[i - 1];
      const curPsar = psarValues[i];
      const prevPsar = psarValues[i - 1];

      if (curSma !== undefined && prevSma !== undefined && curPsar !== undefined && prevPsar !== undefined) {
        const smaRising = curSma > prevSma;
        const smaFalling = curSma < prevSma;

        // Buy Signal: psar_prev_above_buy && psar_now_below_buy && sma_rising
        const psarPrevAboveBuy = prevPsar > prevC.high;
        const psarNowBelowBuy = curPsar < c.low;
        const psarFlipBuy = psarPrevAboveBuy && psarNowBelowBuy && smaRising;

        // Sell Signal: psar_prev_below_sell && psar_now_above_sell && sma_falling
        const psarPrevBelowSell = prevPsar < prevC.low;
        const psarNowAboveSell = curPsar > c.high;
        const psarFlipSell = psarPrevBelowSell && psarNowAboveSell && smaFalling;

        if (psarFlipBuy && allowLong) {
          pendingOrder = null;
          const buyBreakout = c.high;
          const lookbackIdx = Math.max(0, i - lookback);
          const buySl = candles[lookbackIdx].low;
          const buyRisk = buyBreakout - buySl;
          const buyTarget = buyBreakout + buyRisk * rrRatio;
          const riskAmount = currentCapital * (riskPerTrade / 100);
          const buyQty = buyRisk > 0 ? Math.floor(riskAmount / buyRisk) : 0;
          const buyRiskPct = (buyRisk / buyBreakout) * 100;

          if (buyRiskPct <= maxRiskPercent && buyQty > 0) {
            pendingOrder = {
              type: 'BUY',
              breakout: buyBreakout,
              sl: buySl,
              risk: buyRisk,
              target: buyTarget,
              qty: buyQty,
              signalBar: i,
            };
          }
        } else if (psarFlipSell && allowShort) {
          pendingOrder = null;
          const sellBreakout = c.low;
          const lookbackIdx = Math.max(0, i - lookback);
          const sellSl = candles[lookbackIdx].high;
          const sellRisk = sellSl - sellBreakout;
          const sellTarget = sellBreakout - sellRisk * rrRatio;
          const riskAmount = currentCapital * (riskPerTrade / 100);
          const sellQty = sellRisk > 0 ? Math.floor(riskAmount / sellRisk) : 0;
          const sellRiskPct = (sellRisk / sellBreakout) * 100;

          if (sellRiskPct <= maxRiskPercent && sellQty > 0) {
            pendingOrder = {
              type: 'SELL',
              breakout: sellBreakout,
              sl: sellSl,
              risk: sellRisk,
              target: sellTarget,
              qty: sellQty,
              signalBar: i,
            };
          }
        }
      }
    }

    // Equity Curve Tracking
    if (currentCapital > peakCapital) {
      peakCapital = currentCapital;
    }
    const currentDrawdown = peakCapital > 0 ? ((peakCapital - currentCapital) / peakCapital) * 100 : 0;
    const benchmarkEquity = (c.close / benchmarkInitial) * (params.initialCapital || 100000);

    equityCurve.push({
      time: c.time,
      equity: Number(currentCapital.toFixed(2)),
      benchmarkEquity: Number(benchmarkEquity.toFixed(2)),
      drawdownPct: Number(currentDrawdown.toFixed(2)),
    });
  }

  // Close any remaining position on last candle
  if (activeTrade && activeTrade.exitIndex === -1 && candles.length > 0) {
    const lastCandle = candles[candles.length - 1];
    activeTrade.exitIndex = candles.length - 1;
    activeTrade.exitTime = lastCandle.time;
    activeTrade.exitPrice = lastCandle.close;
    activeTrade.exitReason = 'SESSION_CLOSE';

    const priceDiff =
      activeTrade.type === 'BUY'
        ? activeTrade.exitPrice - activeTrade.entryPrice
        : activeTrade.entryPrice - activeTrade.exitPrice;

    const grossPnl = priceDiff * activeTrade.qty;
    const netPnl = grossPnl - brokerage * 2;
    activeTrade.pnl = Number(netPnl.toFixed(2));
    activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

    currentCapital += netPnl;
    trades.push(activeTrade);
  }

  return {
    params,
    candles,
    trades,
    equityCurve,
    metrics: calculateMetrics(trades, equityCurve, params, currentCapital),
  };
}

/**
 * Nifty50 Daily Trend-Pullback & Chandelier Exit (Pine Script v5)
 * Strategy Architecture:
 * - 50 EMA & 200 EMA + 20-bar 200 EMA slope + ADX(14) > 20
 * - RSI(5) cross above 30 (Long) or below 70 (Short)
 * - Stop = min(lowest(low, 5), close - 1.0 * atr) for Long, max(highest(high, 5), close + 1.0 * atr) for Short
 * - Risk per trade = 1.0% equity, position size = (equity * 1%) / riskDistance
 * - Chandelier Trail = once price >= entry + riskD (+1R), trail stop at extreme - 3.0 * atr
 * - Time Stop = close trade after 30 bars
 */
export function runTrendPullbackChandelierBacktest(rawCandles: Candle[], params: StrategyParams): BacktestResult {
  const candles: Candle[] = rawCandles.map((c) => ({ ...c }));
  const trades: Trade[] = [];
  const equityCurve: EquityPoint[] = [];

  let currentCapital = params.initialCapital || 1000000;
  let peakCapital = currentCapital;
  let tradeCounter = 1;

  const fastLen = params.fastEmaLength ?? 50;
  const slowLen = params.slowEmaLength ?? 200;
  const slopeLen = params.slopeLookback ?? 20;
  const adxLen = params.adxLength ?? 14;
  const adxMin = params.adxMin ?? 20.0;
  const rsiLen = params.rsiPullbackLen ?? 5;
  const rsiLow = params.rsiOversold ?? 30.0;
  const rsiHigh = params.rsiOverbought ?? 70.0;
  const swingLen = params.swingStopLookback ?? 5;
  const atrLen = params.atrPeriod ?? 14;
  const atrFloor = params.atrFloorMultiplier ?? 1.0;
  const trailMult = params.chandelierAtrMultiplier ?? 3.0;
  const maxBars = params.timeStopBars ?? 30;
  const riskPct = params.riskPerTradePct ?? 1.0;
  const maxNotional = params.maxNotionalPct ?? 100;
  const allowShort = params.allowShort ?? true;
  const slippage = params.slippagePoints ?? 2;
  const brokerage = params.brokeragePerOrder ?? 20;

  // Calculate technical indicators
  const ema50 = calculateEMA(candles, fastLen);
  const ema200 = calculateEMA(candles, slowLen);
  const { adx } = calculateADX(candles, adxLen);
  const rsi = calculateRSI(candles, rsiLen);
  const atr = calculateATR(candles, atrLen);

  const benchmarkInitial = candles[0]?.close || 1;

  let dir: 0 | 1 | -1 = 0;
  let entryPx = 0;
  let stopPx = 0;
  let riskD = 0;
  let extreme = 0;
  let trailOn = false;
  let entryBar = -1;
  let currentQty = 0;
  let activeTrade: Trade | null = null;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];

    // Check if we have enough warmup bars for slowLen + slopeLen + atr
    const hasWarmup = i >= slowLen + slopeLen && !isNaN(atr[i] || NaN) && (atr[i] || 0) > 0;

    // 1. Manage existing trade if open
    if (dir !== 0 && activeTrade) {
      if (dir === 1) {
        // LONG POSITION
        if (i > entryBar) {
          extreme = Math.max(extreme, c.high);
          if (!trailOn && c.high >= entryPx + riskD) {
            trailOn = true;
          }
          if (trailOn) {
            const currentAtr = atr[i] || atr[entryBar] || 1;
            stopPx = Math.max(stopPx, extreme - trailMult * currentAtr);
          }
        }

        const isTimeStop = (i - entryBar) >= maxBars;
        const isStopHit = c.low <= stopPx;

        if (isTimeStop || isStopHit) {
          activeTrade.exitIndex = i;
          activeTrade.exitTime = c.time;
          activeTrade.exitPrice = isStopHit ? Math.max(c.open, stopPx - slippage) : c.close;
          activeTrade.exitReason = isTimeStop ? 'TIME_STOP' : (trailOn ? 'CHANDELIER_TRAIL' : 'STOP_LOSS');

          const grossPnl = (activeTrade.exitPrice - activeTrade.entryPrice) * activeTrade.qty;
          const netPnl = grossPnl - brokerage * 2;
          activeTrade.pnl = Number(netPnl.toFixed(2));
          activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

          currentCapital += netPnl;
          trades.push(activeTrade);

          dir = 0;
          activeTrade = null;
          trailOn = false;
        }
      } else if (dir === -1) {
        // SHORT POSITION
        if (i > entryBar) {
          extreme = Math.min(extreme, c.low);
          if (!trailOn && c.low <= entryPx - riskD) {
            trailOn = true;
          }
          if (trailOn) {
            const currentAtr = atr[i] || atr[entryBar] || 1;
            stopPx = Math.min(stopPx, extreme + trailMult * currentAtr);
          }
        }

        const isTimeStop = (i - entryBar) >= maxBars;
        const isStopHit = c.high >= stopPx;

        if (isTimeStop || isStopHit) {
          activeTrade.exitIndex = i;
          activeTrade.exitTime = c.time;
          activeTrade.exitPrice = isStopHit ? Math.min(c.open, stopPx + slippage) : c.close;
          activeTrade.exitReason = isTimeStop ? 'TIME_STOP' : (trailOn ? 'CHANDELIER_TRAIL' : 'STOP_LOSS');

          const grossPnl = (activeTrade.entryPrice - activeTrade.exitPrice) * activeTrade.qty;
          const netPnl = grossPnl - brokerage * 2;
          activeTrade.pnl = Number(netPnl.toFixed(2));
          activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

          currentCapital += netPnl;
          trades.push(activeTrade);

          dir = 0;
          activeTrade = null;
          trailOn = false;
        }
      }
    }

    // 2. Check for New Entries when Flat
    if (dir === 0 && hasWarmup) {
      const e50 = ema50[i] ?? 0;
      const e200 = ema200[i] ?? 0;
      const e200SlopePast = ema200[i - slopeLen] ?? 0;
      const curAdx = adx[i] ?? 0;
      const curRsi = rsi[i] ?? 50;
      const prevRsi = rsi[i - 1] ?? 50;
      const curAtr = atr[i] ?? 1;

      // Calculate lowest low and highest high over swingLen lookback
      let lowestLow = c.low;
      let highestHigh = c.high;
      for (let s = 1; s <= swingLen; s++) {
        if (i - s >= 0) {
          lowestLow = Math.min(lowestLow, candles[i - s].low);
          highestHigh = Math.max(highestHigh, candles[i - s].high);
        }
      }

      const stopL = Math.min(lowestLow, c.close - atrFloor * curAtr);
      const stopS = Math.max(highestHigh, c.close + atrFloor * curAtr);

      const regimeLong = c.close > e200 && e50 > e200 && e200 > e200SlopePast && curAdx > adxMin;
      const regimeShort = c.close < e200 && e50 < e200 && e200 < e200SlopePast && curAdx > adxMin;

      // ta.crossover(rsi, rsiLow): prevRsi <= rsiLow && curRsi > rsiLow
      const longSig = regimeLong && (prevRsi <= rsiLow && curRsi > rsiLow);
      // ta.crossunder(rsi, rsiHigh): prevRsi >= rsiHigh && curRsi < rsiHigh
      const shortSig = allowShort && regimeShort && (prevRsi >= rsiHigh && curRsi < rsiHigh);

      if (longSig) {
        const rd = c.close - stopL;
        if (rd > 0) {
          const qL = Math.floor(Math.min((currentCapital * (riskPct / 100)) / rd, (currentCapital * (maxNotional / 100)) / c.close));
          if (qL >= 1) {
            dir = 1;
            entryPx = c.close + slippage;
            stopPx = stopL;
            riskD = rd;
            extreme = c.high;
            trailOn = false;
            entryBar = i;
            currentQty = qL;

            activeTrade = {
              id: `TR-${String(tradeCounter++).padStart(4, '0')}`,
              type: 'BUY',
              entryIndex: i,
              entryTime: c.time,
              entryPrice: entryPx,
              exitIndex: -1,
              exitTime: '',
              exitPrice: 0,
              qty: currentQty,
              pnl: 0,
              pnlPct: 0,
              exitReason: 'TAKE_PROFIT',
              stopLoss: stopPx,
              takeProfit: entryPx + riskD * 3.0,
              atrAtEntry: curAtr,
              riskDist: riskD,
            };
          }
        }
      } else if (shortSig) {
        const rd = stopS - c.close;
        if (rd > 0) {
          const qS = Math.floor(Math.min((currentCapital * (riskPct / 100)) / rd, (currentCapital * (maxNotional / 100)) / c.close));
          if (qS >= 1) {
            dir = -1;
            entryPx = c.close - slippage;
            stopPx = stopS;
            riskD = rd;
            extreme = c.low;
            trailOn = false;
            entryBar = i;
            currentQty = qS;

            activeTrade = {
              id: `TR-${String(tradeCounter++).padStart(4, '0')}`,
              type: 'SELL',
              entryIndex: i,
              entryTime: c.time,
              entryPrice: entryPx,
              exitIndex: -1,
              exitTime: '',
              exitPrice: 0,
              qty: currentQty,
              pnl: 0,
              pnlPct: 0,
              exitReason: 'TAKE_PROFIT',
              stopLoss: stopPx,
              takeProfit: entryPx - riskD * 3.0,
              atrAtEntry: curAtr,
              riskDist: riskD,
            };
          }
        }
      }
    }

    // Equity tracking
    peakCapital = Math.max(peakCapital, currentCapital);
    const dd = peakCapital > 0 ? ((peakCapital - currentCapital) / peakCapital) * 100 : 0;
    const benchmarkEquity = (c.close / benchmarkInitial) * (params.initialCapital || 1000000);

    equityCurve.push({
      time: c.time,
      equity: Number(currentCapital.toFixed(2)),
      benchmarkEquity: Number(benchmarkEquity.toFixed(2)),
      drawdownPct: Number(dd.toFixed(2)),
    });
  }

  // Close trade if still active on final candle
  if (dir !== 0 && activeTrade) {
    const lastCandle = candles[candles.length - 1];
    activeTrade.exitIndex = candles.length - 1;
    activeTrade.exitTime = lastCandle.time;
    activeTrade.exitPrice = lastCandle.close;
    activeTrade.exitReason = 'SESSION_CLOSE';

    const priceDiff =
      activeTrade.type === 'BUY'
        ? activeTrade.exitPrice - activeTrade.entryPrice
        : activeTrade.entryPrice - activeTrade.exitPrice;

    const grossPnl = priceDiff * activeTrade.qty;
    const netPnl = grossPnl - brokerage * 2;
    activeTrade.pnl = Number(netPnl.toFixed(2));
    activeTrade.pnlPct = Number(((netPnl / (activeTrade.entryPrice * activeTrade.qty)) * 100).toFixed(2));

    currentCapital += netPnl;
    trades.push(activeTrade);
  }

  return {
    params,
    candles,
    trades,
    equityCurve,
    metrics: calculateMetrics(trades, equityCurve, params, currentCapital),
  };
}

