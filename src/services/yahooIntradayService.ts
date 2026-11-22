import { Candle } from '../types/backtest';

export type IntradayInterval = '5m' | '15m' | '30m' | '1h';

export interface ReplayTickerPreset {
  label: string;
  symbol: string;
}

export const REPLAY_TICKER_PRESETS: ReplayTickerPreset[] = [
  { label: 'NIFTY 50', symbol: '^NSEI' },
  { label: 'BANK NIFTY', symbol: '^NSEBANK' },
  { label: 'RELIANCE', symbol: 'RELIANCE.NS' },
  { label: 'TCS', symbol: 'TCS.NS' },
  { label: 'HDFC BANK', symbol: 'HDFCBANK.NS' },
  { label: 'INFOSYS', symbol: 'INFY.NS' },
  { label: 'TATA MOTORS', symbol: 'TATAMOTORS.NS' },
  { label: 'ICICI BANK', symbol: 'ICICIBANK.NS' },
  { label: 'S&P 500', symbol: '^GSPC' },
  { label: 'AAPL', symbol: 'AAPL' },
  { label: 'EURUSD', symbol: 'EURUSD=X' },
  { label: 'Gold', symbol: 'GC=F' },
  { label: 'Crude Oil', symbol: 'CL=F' },
  { label: 'BTC-USD', symbol: 'BTC-USD' },
];

export const intradayCache = new Map<string, Candle[]>();

export function clearIntradayCache(): void {
  intradayCache.clear();
}

export async function fetchIntradayCandles(
  symbol: string,
  interval: '5m' | '15m' | '30m' | '1h',
  lookbackDays?: number
): Promise<Candle[]> {
  // Respect Yahoo Finance limits: 5m/15m max 60 days, 30m/1h max 730 days
  const maxDays = interval === '5m' || interval === '15m' ? 60 : 730;
  const defaultDays = interval === '5m' || interval === '15m' ? 60 : 180;
  const requestedDays = lookbackDays !== undefined && lookbackDays !== null ? lookbackDays : defaultDays;
  const effectiveLookbackDays = Math.min(requestedDays, maxDays);

  // Computes period1 and period2 as UNIX seconds
  const period2 = Math.floor(Date.now() / 1000);
  const period1 = period2 - Math.floor(effectiveLookbackDays * 86400);

  const cacheKey = `${symbol}_${interval}_${period1}_${period2}`;

  // Check exact cache key first
  if (intradayCache.has(cacheKey)) {
    return intradayCache.get(cacheKey)!;
  }

  // Check recent cached entry for same symbol and interval within 60-second window
  for (const [key, cached] of intradayCache.entries()) {
    const lastUnderscore = key.lastIndexOf('_');
    const secondLastUnderscore = key.lastIndexOf('_', lastUnderscore - 1);
    const thirdLastUnderscore = key.lastIndexOf('_', secondLastUnderscore - 1);
    if (thirdLastUnderscore !== -1) {
      const kSymbol = key.slice(0, thirdLastUnderscore);
      const kInterval = key.slice(thirdLastUnderscore + 1, secondLastUnderscore);
      const kPeriod1 = Number(key.slice(secondLastUnderscore + 1, lastUnderscore));
      const kPeriod2 = Number(key.slice(lastUnderscore + 1));
      if (
        kSymbol === symbol &&
        kInterval === interval &&
        Math.abs(kPeriod2 - period2) <= 60 &&
        Math.abs((kPeriod2 - kPeriod1) - (period2 - period1)) <= 60
      ) {
        return cached;
      }
    }
  }

  const encodedSymbol = encodeURIComponent(symbol);
  const queryParams = `interval=${interval}&period1=${period1}&period2=${period2}&includePrePost=false`;

  // Tries proxy URL first, falls back to direct query1 and query2
  const urls: string[] = [
    `/yahoo-api/v8/finance/chart/${encodedSymbol}?${queryParams}`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?${queryParams}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?${queryParams}`,
  ];

  const headers: Record<string, string> = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    Accept: 'application/json, text/plain, */*',
  };

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        continue;
      }

      const json = await res.json();
      const result = json?.chart?.result?.[0];
      if (!result) {
        continue;
      }

      const timestamps: number[] = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};
      const opens: (number | null)[] = quote.open || [];
      const highs: (number | null)[] = quote.high || [];
      const lows: (number | null)[] = quote.low || [];
      const closes: (number | null)[] = quote.close || [];
      const volumes: (number | null)[] = quote.volume || [];

      const candles: Candle[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const ts = timestamps[i];
        const o = opens[i];
        const h = highs[i];
        const l = lows[i];
        const c = closes[i];
        const v = volumes[i];

        // Filter out null/NaN bars
        if (
          ts == null ||
          o == null ||
          h == null ||
          l == null ||
          c == null ||
          isNaN(ts) ||
          isNaN(o) ||
          isNaN(h) ||
          isNaN(l) ||
          isNaN(c)
        ) {
          continue;
        }

        const tsMs = ts * 1000;
        const d = new Date(tsMs);

        candles.push({
          time: d.toLocaleString(),
          timestamp: tsMs,
          isoString: d.toISOString(),
          open: Number(o),
          high: Number(h),
          low: Number(l),
          close: Number(c),
          volume: v != null && !isNaN(v) ? Math.round(Number(v)) : 0,
        });
      }

      if (candles.length > 0) {
        candles.sort((a, b) => a.timestamp - b.timestamp);
        intradayCache.set(cacheKey, candles);
        return candles;
      }
    } catch (_) {
      // Continue to next endpoint on failure
    }
  }

  throw new Error(`Failed to fetch intraday data for ${symbol} (${interval})`);
}
