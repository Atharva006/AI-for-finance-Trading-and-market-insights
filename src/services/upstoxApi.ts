import { Candle } from '../types/backtest';
import { calculateStochastic, calculateATR } from './indicators';

const UPSTOX_BASE_PROXY = '/upstox-api/v2';
const UPSTOX_DIRECT_BASE = 'https://api.upstox.com/v2';

export interface FetchCandlesParams {
  instrumentKey: string;
  timeframe: string; // '1m' | '5m' | '15m' | '30m' | '1h' | '1d'
  fromDate?: string;
  toDate?: string;
  token?: string;
}

export interface LiveQuote {
  symbol: string;
  instrumentKey: string;
  lastPrice: number;
  netChange: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: string;
}

/**
 * Maps app timeframe to Upstox API interval
 */
function mapTimeframeToUpstox(tf: string): { interval: string; isIntraday: boolean; resampleMinutes: number } {
  switch (tf) {
    case '1m':
    case '1minute':
      return { interval: '1minute', isIntraday: true, resampleMinutes: 1 };
    case '5m':
    case '5minute':
      return { interval: '1minute', isIntraday: true, resampleMinutes: 5 };
    case '15m':
    case '15minute':
      return { interval: '1minute', isIntraday: true, resampleMinutes: 15 };
    case '30m':
    case '30minute':
      return { interval: '30minute', isIntraday: true, resampleMinutes: 30 };
    case '1h':
    case '60m':
      return { interval: '30minute', isIntraday: true, resampleMinutes: 60 };
    case '4h':
    case '240m':
      return { interval: '30minute', isIntraday: true, resampleMinutes: 240 };
    case '1d':
    case 'day':
    default:
      return { interval: 'day', isIntraday: false, resampleMinutes: 0 };
  }
}

/**
 * Resamples 1-minute candles into institutional N-minute bars (e.g. 5m, 15m)
 */
export function resampleCandles(rawCandles: Candle[], targetMinutes: number): Candle[] {
  if (targetMinutes <= 1 || rawCandles.length === 0) return rawCandles;

  const resampled: Candle[] = [];
  let currentBucket: Candle[] = [];
  let currentBucketKey: string | null = null;
  let bucketTimestamp = 0;
  let bucketIso = '';

  for (const c of rawCandles) {
    const d = new Date(c.timestamp);
    const year = d.getFullYear();
    const month = d.getMonth();
    const date = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const bucketStartMinutes = Math.floor(totalMinutes / targetMinutes) * targetMinutes;
    const bucketHour = Math.floor(bucketStartMinutes / 60);
    const bucketMin = bucketStartMinutes % 60;
    const bucketKey = `${year}-${month}-${date}-${bucketHour}-${bucketMin}`;

    if (currentBucketKey !== bucketKey) {
      if (currentBucket.length > 0) {
        const open = currentBucket[0].open;
        const high = Math.max(...currentBucket.map((x) => x.high));
        const low = Math.min(...currentBucket.map((x) => x.low));
        const close = currentBucket[currentBucket.length - 1].close;
        const volume = currentBucket.reduce((sum, x) => sum + x.volume, 0);
        const bDate = new Date(bucketTimestamp);

        resampled.push({
          time: bDate.toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          timestamp: bucketTimestamp,
          isoString: bucketIso,
          open,
          high,
          low,
          close,
          volume,
        });
      }
      currentBucket = [c];
      currentBucketKey = bucketKey;
      const bDate = new Date(year, month, date, bucketHour, bucketMin, 0, 0);
      bucketTimestamp = bDate.getTime();
      bucketIso = c.isoString || bDate.toISOString();
    } else {
      currentBucket.push(c);
    }
  }

  if (currentBucket.length > 0) {
    const open = currentBucket[0].open;
    const high = Math.max(...currentBucket.map((x) => x.high));
    const low = Math.min(...currentBucket.map((x) => x.low));
    const close = currentBucket[currentBucket.length - 1].close;
    const volume = currentBucket.reduce((sum, x) => sum + x.volume, 0);
    const bDate = new Date(bucketTimestamp);

    resampled.push({
      time: bDate.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      timestamp: bucketTimestamp,
      isoString: bucketIso,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return resampled;
}

function getUpstoxToken(): string {
  try {
    if (typeof import.meta !== 'undefined' && import.meta?.env?.VITE_UPSTOX_ACCESS_TOKEN) {
      return import.meta.env.VITE_UPSTOX_ACCESS_TOKEN;
    }
  } catch (_) {}
  try {
    if (typeof process !== 'undefined' && process?.env?.VITE_UPSTOX_ACCESS_TOKEN) {
      return process.env.VITE_UPSTOX_ACCESS_TOKEN;
    }
  } catch (_) {}
  return '';
}

/**
 * Fetches 100% REAL live market quotes from Upstox API (NSE Live Feed)
 * NEVER uses mock data.
 */
export async function fetchLiveQuotes(instrumentKeys: string[]): Promise<Record<string, LiveQuote>> {
  const token = getUpstoxToken();
  const joinedKeys = instrumentKeys.map((k) => encodeURIComponent(k)).join(',');

  const urls = [
    `${UPSTOX_BASE_PROXY}/market-quote/quotes?instrument_key=${joinedKeys}`,
    `${UPSTOX_DIRECT_BASE}/market-quote/quotes?instrument_key=${joinedKeys}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const result: Record<string, LiveQuote> = {};
          for (const key in json.data) {
            const item = json.data[key];
            const lastPrice = Number(item.last_price || 0);
            const netChange = Number(item.net_change || 0);
            const prevClose = lastPrice - netChange;
            const changePct = prevClose !== 0 ? Number(((netChange / prevClose) * 100).toFixed(2)) : 0;

            result[key] = {
              symbol: item.symbol || key,
              instrumentKey: item.instrument_token || key,
              lastPrice,
              netChange: Number(netChange.toFixed(2)),
              changePct,
              open: Number(item.ohlc?.open || 0),
              high: Number(item.ohlc?.high || 0),
              low: Number(item.ohlc?.low || 0),
              close: Number(item.ohlc?.close || lastPrice),
              timestamp: item.timestamp || new Date().toISOString(),
            };
          }
          return result;
        }
      }
    } catch (e) {
      console.warn(`Live quote fetch failed on ${url}:`, e);
    }
  }

  return {};
}

/**
 * Fetches 100% REAL historical & intraday candle data from Upstox API
 * NEVER uses mock data.
 */
export async function fetchUpstoxCandles(params: FetchCandlesParams): Promise<Candle[]> {
  const token = params.token || getUpstoxToken();

  const instrumentKey = params.instrumentKey || 'NSE_INDEX|Nifty 50';
  const encodedKey = encodeURIComponent(instrumentKey);
  const { interval, isIntraday, resampleMinutes } = mapTimeframeToUpstox(params.timeframe);

  const now = new Date();
  const toDate = params.toDate || now.toISOString().split('T')[0];
  // Intraday limit is 30 days max on Upstox API; Daily is 300 days (within 1-year Upstox limit)
  const fromDateObj = isIntraday
    ? new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 300 * 24 * 60 * 60 * 1000);
  const fromDate = params.fromDate || fromDateObj.toISOString().split('T')[0];

  const headers = {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const rawCandlesMap = new Map<string, any>();

  // 1. Fetch 30-day historical candles first (gives all 20+ trading days!)
  const historicalUrls = [
    `${UPSTOX_BASE_PROXY}/historical-candle/${encodedKey}/${interval}/${toDate}/${fromDate}`,
    `${UPSTOX_DIRECT_BASE}/historical-candle/${encodedKey}/${interval}/${toDate}/${fromDate}`,
  ];

  for (const url of historicalUrls) {
    try {
      const response = await fetch(url, { method: 'GET', headers });
      if (response.ok) {
        const json = await response.json();
        if (json.status === 'success' && json.data && Array.isArray(json.data.candles)) {
          for (const c of json.data.candles) {
            rawCandlesMap.set(c[0], c);
          }
          if (rawCandlesMap.size > 0) break;
        }
      }
    } catch (e) {
      console.warn(`Upstox historical fetch failed on ${url}:`, e);
    }
  }

  // 2. For intraday, also fetch today's live session and merge
  if (isIntraday) {
    const intradayUrls = [
      `${UPSTOX_BASE_PROXY}/historical-candle/intraday/${encodedKey}/${interval}`,
      `${UPSTOX_DIRECT_BASE}/historical-candle/intraday/${encodedKey}/${interval}`,
    ];

    for (const url of intradayUrls) {
      try {
        const response = await fetch(url, { method: 'GET', headers });
        if (response.ok) {
          const json = await response.json();
          if (json.status === 'success' && json.data && Array.isArray(json.data.candles)) {
            for (const c of json.data.candles) {
              rawCandlesMap.set(c[0], c);
            }
            break;
          }
        }
      } catch (e) {
        console.warn(`Upstox intraday today fetch failed on ${url}:`, e);
      }
    }
  }

  if (rawCandlesMap.size > 0) {
    // Sort all candles chronologically (oldest to newest)
    const sorted = Array.from(rawCandlesMap.values()).sort(
      (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
    );

    let parsed: Candle[] = sorted.map((c: any) => {
      const d = new Date(c[0]);
      return {
        time: d.toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          ...(params.timeframe !== '1d' ? { hour: '2-digit', minute: '2-digit' } : {}),
        }),
        timestamp: d.getTime(),
        isoString: typeof c[0] === 'string' ? c[0] : d.toISOString(),
        open: Number(c[1]),
        high: Number(c[2]),
        low: Number(c[3]),
        close: Number(c[4]),
        volume: Number(c[5]) || 0,
      };
    });

    // Resample 1m into 5m, 15m, etc.
    if (resampleMinutes > 1) {
      parsed = resampleCandles(parsed, resampleMinutes);
    }

    // Calculate indicators on real candles
    enrichCandlesWithIndicators(parsed);
    return parsed;
  }

  // If no candles found, return empty array (NO mock database!)
  console.warn(`Upstox API returned no candles for ${instrumentKey} (${params.timeframe}). Zero mock data.`);
  return [];
}

/**
 * Enriches candles with Stochastic (%K, %D) and ATR
 */
export function enrichCandlesWithIndicators(
  candles: Candle[],
  stochKPeriod = 14,
  stochSmooth = 3,
  stochDPeriod = 3,
  atrPeriod = 14
) {
  if (candles.length === 0) return;
  const { stochK, stochD } = calculateStochastic(candles, stochKPeriod, stochSmooth, stochDPeriod);
  const atr = calculateATR(candles, atrPeriod);

  for (let i = 0; i < candles.length; i++) {
    candles[i].stochK = stochK[i];
    candles[i].stochD = stochD[i];
    candles[i].atr = atr[i];
  }
}
