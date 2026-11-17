import { Candle } from '../types/backtest';

/**
 * Calculates Stochastic Oscillator (%K and %D)
 * @param candles Array of Candles
 * @param kPeriod Lookback period for %K (default 14)
 * @param kSmooth Smoothing for %K (default 3)
 * @param dPeriod Period for %D SMA (default 3)
 */
export function calculateStochastic(
  candles: Candle[],
  kPeriod: number = 14,
  kSmooth: number = 3,
  dPeriod: number = 3
): { stochK: (number | undefined)[]; stochD: (number | undefined)[] } {
  const n = candles.length;
  const rawK: (number | undefined)[] = new Array(n).fill(undefined);
  const stochK: (number | undefined)[] = new Array(n).fill(undefined);
  const stochD: (number | undefined)[] = new Array(n).fill(undefined);

  if (n < kPeriod) {
    return { stochK, stochD };
  }

  // 1. Calculate Raw %K
  for (let i = kPeriod - 1; i < n; i++) {
    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (let j = i - kPeriod + 1; j <= i; j++) {
      if (candles[j].high > highestHigh) highestHigh = candles[j].high;
      if (candles[j].low < lowestLow) lowestLow = candles[j].low;
    }

    const range = highestHigh - lowestLow;
    if (range === 0) {
      rawK[i] = 50;
    } else {
      rawK[i] = ((candles[i].close - lowestLow) / range) * 100;
    }
  }

  // 2. Smooth Raw %K (SMA of kSmooth)
  for (let i = kPeriod - 1 + kSmooth - 1; i < n; i++) {
    let sum = 0;
    let valid = true;

    for (let j = i - kSmooth + 1; j <= i; j++) {
      if (rawK[j] === undefined) {
        valid = false;
        break;
      }
      sum += rawK[j]!;
    }

    if (valid) {
      stochK[i] = Number((sum / kSmooth).toFixed(2));
    }
  }

  // 3. Calculate %D (SMA of stochK of length dPeriod)
  for (let i = kPeriod - 1 + kSmooth - 1 + dPeriod - 1; i < n; i++) {
    let sum = 0;
    let valid = true;

    for (let j = i - dPeriod + 1; j <= i; j++) {
      if (stochK[j] === undefined) {
        valid = false;
        break;
      }
      sum += stochK[j]!;
    }

    if (valid) {
      stochD[i] = Number((sum / dPeriod).toFixed(2));
    }
  }

  return { stochK, stochD };
}

/**
 * Calculates Average True Range (ATR) with Wilder's Smoothing
 * @param candles Array of Candles
 * @param period Lookback period (default 14)
 */
export function calculateATR(
  candles: Candle[],
  period: number = 14
): (number | undefined)[] {
  const n = candles.length;
  const atr: (number | undefined)[] = new Array(n).fill(undefined);

  if (n <= period) {
    return atr;
  }

  const tr: number[] = new Array(n);
  tr[0] = candles[0].high - candles[0].low;

  for (let i = 1; i < n; i++) {
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr1 = currentHigh - currentLow;
    const tr2 = Math.abs(currentHigh - prevClose);
    const tr3 = Math.abs(currentLow - prevClose);

    tr[i] = Math.max(tr1, tr2, tr3);
  }

  // First ATR is simple SMA of first 'period' TR values
  let sumTR = 0;
  for (let i = 0; i < period; i++) {
    sumTR += tr[i];
  }
  let prevATR = sumTR / period;
  atr[period - 1] = Number(prevATR.toFixed(2));

  // Wilder's smoothing for subsequent values
  for (let i = period; i < n; i++) {
    const currentATR = (prevATR * (period - 1) + tr[i]) / period;
    atr[i] = Number(currentATR.toFixed(2));
    prevATR = currentATR;
  }

  return atr;
}

/**
 * Calculates Simple Moving Average (SMA)
 * @param candles Array of Candles
 * @param length Lookback length (default 100)
 */
export function calculateSMA(
  candles: Candle[],
  length: number = 100
): (number | undefined)[] {
  const n = candles.length;
  const sma: (number | undefined)[] = new Array(n).fill(undefined);

  if (n < length) {
    return sma;
  }

  let sum = 0;
  for (let i = 0; i < length; i++) {
    sum += candles[i].close;
  }
  sma[length - 1] = Number((sum / length).toFixed(2));

  for (let i = length; i < n; i++) {
    sum += candles[i].close - candles[i - length].close;
    sma[i] = Number((sum / length).toFixed(2));
  }

  return sma;
}

/**
 * Calculates Parabolic SAR (Strict Pine Script v5 ta.sar fidelity)
 * @param candles Array of Candles
 * @param start Start acceleration factor (default 0.01)
 * @param step AF increment step (default 0.01)
 * @param max Maximum AF (default 0.10)
 */
export function calculatePSAR(
  candles: Candle[],
  start: number = 0.01,
  step: number = 0.01,
  max: number = 0.10
): (number | undefined)[] {
  const n = candles.length;
  const psar: (number | undefined)[] = new Array(n).fill(undefined);

  if (n < 2) {
    return psar;
  }

  let isLong = candles[1].close >= candles[0].close;
  let af = start;
  let ep = isLong
    ? Math.max(candles[0].high, candles[1].high)
    : Math.min(candles[0].low, candles[1].low);
  let curSar = isLong
    ? Math.min(candles[0].low, candles[1].low)
    : Math.max(candles[0].high, candles[1].high);

  psar[0] = Number(curSar.toFixed(2));
  psar[1] = Number(curSar.toFixed(2));

  for (let i = 2; i < n; i++) {
    let nextSar = curSar + af * (ep - curSar);

    if (isLong) {
      nextSar = Math.min(nextSar, candles[i - 1].low, candles[i - 2].low);
      if (candles[i].low < nextSar) {
        // Flip to Short
        isLong = false;
        curSar = Math.max(ep, candles[i].high, candles[i - 1].high);
        ep = candles[i].low;
        af = start;
      } else {
        curSar = nextSar;
        if (candles[i].high > ep) {
          ep = candles[i].high;
          af = Math.min(af + step, max);
        }
      }
    } else {
      nextSar = Math.max(nextSar, candles[i - 1].high, candles[i - 2].high);
      if (candles[i].high > nextSar) {
        // Flip to Long
        isLong = true;
        curSar = Math.min(ep, candles[i].low, candles[i - 1].low);
        ep = candles[i].high;
        af = start;
      } else {
        curSar = nextSar;
        if (candles[i].low < ep) {
          ep = candles[i].low;
          af = Math.min(af + step, max);
        }
      }
    }
    psar[i] = Number(curSar.toFixed(2));
  }

  return psar;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: Candle[], length: number = 20): (number | undefined)[] {
  const n = candles.length;
  const ema: (number | undefined)[] = new Array(n).fill(undefined);
  if (n < length) return ema;

  let sum = 0;
  for (let i = 0; i < length; i++) sum += candles[i].close;
  let prevEma = sum / length;
  ema[length - 1] = Number(prevEma.toFixed(2));

  const k = 2 / (length + 1);
  for (let i = length; i < n; i++) {
    const currentEma = (candles[i].close - prevEma) * k + prevEma;
    ema[i] = Number(currentEma.toFixed(2));
    prevEma = currentEma;
  }
  return ema;
}

/**
 * Calculates Relative Strength Index (RSI - Wilder's Smoothing)
 */
export function calculateRSI(candles: Candle[], period: number = 14): (number | undefined)[] {
  const n = candles.length;
  const rsi: (number | undefined)[] = new Array(n).fill(undefined);
  if (n <= period) return rsi;

  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;
  rsi[period] = avgLoss === 0 ? 100 : Number((100 - 100 / (1 + avgGain / avgLoss)).toFixed(2));

  for (let i = period + 1; i < n; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi[i] = 100;
    } else {
      const rs = avgGain / avgLoss;
      rsi[i] = Number((100 - 100 / (1 + rs)).toFixed(2));
    }
  }
  return rsi;
}

/**
 * Calculates MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  candles: Candle[],
  fast: number = 12,
  slow: number = 26,
  signal: number = 9
): { macdLine: (number | undefined)[]; signalLine: (number | undefined)[]; histogram: (number | undefined)[] } {
  const n = candles.length;
  const fastEma = calculateEMA(candles, fast);
  const slowEma = calculateEMA(candles, slow);

  const macdLine: (number | undefined)[] = new Array(n).fill(undefined);
  for (let i = 0; i < n; i++) {
    if (fastEma[i] !== undefined && slowEma[i] !== undefined) {
      macdLine[i] = Number((fastEma[i]! - slowEma[i]!).toFixed(2));
    }
  }

  // Calculate Signal line (EMA of MACD line)
  const validMacdIdx = macdLine.findIndex((v) => v !== undefined);
  const signalLine: (number | undefined)[] = new Array(n).fill(undefined);
  const histogram: (number | undefined)[] = new Array(n).fill(undefined);

  if (validMacdIdx >= 0 && n - validMacdIdx >= signal) {
    let sum = 0;
    for (let i = validMacdIdx; i < validMacdIdx + signal; i++) {
      sum += macdLine[i]!;
    }
    let prevSig = sum / signal;
    signalLine[validMacdIdx + signal - 1] = Number(prevSig.toFixed(2));
    histogram[validMacdIdx + signal - 1] = Number((macdLine[validMacdIdx + signal - 1]! - prevSig).toFixed(2));

    const k = 2 / (signal + 1);
    for (let i = validMacdIdx + signal; i < n; i++) {
      const curSig = (macdLine[i]! - prevSig) * k + prevSig;
      signalLine[i] = Number(curSig.toFixed(2));
      histogram[i] = Number((macdLine[i]! - curSig).toFixed(2));
      prevSig = curSig;
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Calculates Bollinger Bands (Upper, Middle, Lower)
 */
export function calculateBollingerBands(
  candles: Candle[],
  length: number = 20,
  mult: number = 2.0
): { upper: (number | undefined)[]; middle: (number | undefined)[]; lower: (number | undefined)[] } {
  const n = candles.length;
  const middle = calculateSMA(candles, length);
  const upper: (number | undefined)[] = new Array(n).fill(undefined);
  const lower: (number | undefined)[] = new Array(n).fill(undefined);

  for (let i = length - 1; i < n; i++) {
    const mean = middle[i]!;
    let varianceSum = 0;
    for (let j = i - length + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / length);
    upper[i] = Number((mean + mult * stdDev).toFixed(2));
    lower[i] = Number((mean - mult * stdDev).toFixed(2));
  }

  return { upper, middle, lower };
}

/**
 * Calculates Supertrend
 */
export function calculateSupertrend(
  candles: Candle[],
  period: number = 10,
  multiplier: number = 3.0
): { supertrend: (number | undefined)[]; direction: (1 | -1 | undefined)[] } {
  const n = candles.length;
  const atr = calculateATR(candles, period);
  const supertrend: (number | undefined)[] = new Array(n).fill(undefined);
  const direction: (1 | -1 | undefined)[] = new Array(n).fill(undefined);

  if (n <= period) return { supertrend, direction };

  let prevST = 0;
  let prevDir: 1 | -1 = 1;

  for (let i = period; i < n; i++) {
    const curAtr = atr[i] || 0;
    const hl2 = (candles[i].high + candles[i].low) / 2;
    const upperBand = hl2 + multiplier * curAtr;
    const lowerBand = hl2 - multiplier * curAtr;

    let curDir: 1 | -1 = prevDir;
    let curST = prevST;

    if (candles[i].close > prevST && prevDir === -1) {
      curDir = 1;
      curST = lowerBand;
    } else if (candles[i].close < prevST && prevDir === 1) {
      curDir = -1;
      curST = upperBand;
    } else {
      if (curDir === 1) {
        curST = Math.max(lowerBand, prevST);
      } else {
        curST = Math.min(upperBand, prevST);
      }
    }

    supertrend[i] = Number(curST.toFixed(2));
    direction[i] = curDir;
    prevST = curST;
    prevDir = curDir;
  }

  return { supertrend, direction };
}

/**
 * Calculates Directional Movement Index (DMI) and Average Directional Index (ADX)
 * following TradingView ta.dmi(adxLen, adxLen) Wilder RMA standard.
 */
export function calculateADX(
  candles: Candle[],
  length: number = 14
): { diP: (number | undefined)[]; diM: (number | undefined)[]; adx: (number | undefined)[] } {
  const n = candles.length;
  const diP: (number | undefined)[] = new Array(n).fill(undefined);
  const diM: (number | undefined)[] = new Array(n).fill(undefined);
  const adx: (number | undefined)[] = new Array(n).fill(undefined);

  if (n <= length) return { diP, diM, adx };

  const tr: number[] = new Array(n).fill(0);
  const plusDM: number[] = new Array(n).fill(0);
  const minusDM: number[] = new Array(n).fill(0);

  for (let i = 1; i < n; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevHigh = candles[i - 1].high;
    const prevLow = candles[i - 1].low;
    const prevClose = candles[i - 1].close;

    tr[i] = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));

    const up = high - prevHigh;
    const down = prevLow - low;

    plusDM[i] = up > down && up > 0 ? up : 0;
    minusDM[i] = down > up && down > 0 ? down : 0;
  }

  // Wilder RMA helper function
  let smoothTR = 0;
  let smoothPlusDM = 0;
  let smoothMinusDM = 0;

  for (let i = 1; i <= length; i++) {
    smoothTR += tr[i];
    smoothPlusDM += plusDM[i];
    smoothMinusDM += minusDM[i];
  }

  const dx: number[] = new Array(n).fill(0);

  for (let i = length; i < n; i++) {
    if (i > length) {
      smoothTR = smoothTR - smoothTR / length + tr[i];
      smoothPlusDM = smoothPlusDM - smoothPlusDM / length + plusDM[i];
      smoothMinusDM = smoothMinusDM - smoothMinusDM / length + minusDM[i];
    }

    const pDI = smoothTR > 0 ? (100 * smoothPlusDM) / smoothTR : 0;
    const mDI = smoothTR > 0 ? (100 * smoothMinusDM) / smoothTR : 0;

    diP[i] = Number(pDI.toFixed(2));
    diM[i] = Number(mDI.toFixed(2));

    const diSum = pDI + mDI;
    dx[i] = diSum > 0 ? (100 * Math.abs(pDI - mDI)) / diSum : 0;
  }

  // Calculate ADX via Wilder RMA of DX
  let smoothDX = 0;
  for (let i = length; i < length * 2 && i < n; i++) {
    smoothDX += dx[i];
  }

  const adxStart = length * 2 - 1;
  if (adxStart < n) {
    smoothDX = smoothDX / length;
    adx[adxStart] = Number(smoothDX.toFixed(2));

    for (let i = adxStart + 1; i < n; i++) {
      smoothDX = (smoothDX * (length - 1) + dx[i]) / length;
      adx[i] = Number(smoothDX.toFixed(2));
    }
  }

  return { diP, diM, adx };
}

