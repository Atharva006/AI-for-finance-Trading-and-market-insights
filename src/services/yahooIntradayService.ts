import { Candle } from '../types/backtest';
import { ALL_NIFTY_50_STOCKS } from './nifty50Data';

export type IntradayInterval = '5m' | '15m' | '30m' | '1h' | '1d';

export interface ReplayTickerPreset {
  label: string;
  symbol: string;
  category?: string;
}

export const REPLAY_TICKER_PRESETS: ReplayTickerPreset[] = [
  // ── Benchmarks & Indices ──
  { label: 'NIFTY 50 (Index)', symbol: '^NSEI', category: 'Indices' },
  { label: 'BANK NIFTY (Index)', symbol: '^NSEBANK', category: 'Indices' },
  { label: 'FIN NIFTY (Index)', symbol: 'NIFTY_FIN_SERVICE.NS', category: 'Indices' },
  { label: 'NIFTY IT (Index)', symbol: '^CNXIT', category: 'Indices' },
  { label: 'NIFTY AUTO (Index)', symbol: '^CNXAUTO', category: 'Indices' },

  // ── All 50 NIFTY 50 Constituent Stocks ──
  ...ALL_NIFTY_50_STOCKS.map((s) => ({
    label: `${s.symbol} · ${s.name}`,
    symbol: s.yahoo_symbol,
    category: `NIFTY 50: ${s.sector}`,
  })),

  // ── Macro & Global Assets ──
  { label: 'S&P 500', symbol: '^GSPC', category: 'Global' },
  { label: 'Apple Inc. (AAPL)', symbol: 'AAPL', category: 'Global' },
  { label: 'EUR / USD Forex', symbol: 'EURUSD=X', category: 'Global' },
  { label: 'Gold Spot (GC=F)', symbol: 'GC=F', category: 'Commodities' },
  { label: 'Crude Oil WTI', symbol: 'CL=F', category: 'Commodities' },
  { label: 'Bitcoin (BTC-USD)', symbol: 'BTC-USD', category: 'Crypto' },
];

export const intradayCache = new Map<string, Candle[]>();

export function clearIntradayCache(): void {
  intradayCache.clear();
}

export async function fetchIntradayCandles(
  symbol: string,
  interval: IntradayInterval,
  lookbackDays?: number
): Promise<Candle[]> {
  // Yahoo Finance limits:
  // 5m, 15m, 30m: strict 60 days limit (must be <= 58 days to avoid API boundary errors)
  // 1h: up to 730 days (default 180 days)
  // 1d: up to multiple years (default 365 days / 1 year)
  let maxDays = 58;
  let defaultDays = 55;
  let rangeParam = '60d';

  if (interval === '1h') {
    maxDays = 720;
    defaultDays = 180;
    rangeParam = '6mo';
  } else if (interval === '1d') {
    maxDays = 1825; // 5 years
    defaultDays = 365; // 1 year
    rangeParam = '2y';
  }

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
  const rangeQueryParams = `interval=${interval}&range=${rangeParam}&includePrePost=false`;

  // Tries proxy URL first, falls back to direct query1 and query2, with period and range failovers
  const urls: string[] = [
    `/yahoo-api/v8/finance/chart/${encodedSymbol}?${queryParams}`,
    `/yahoo-api/v8/finance/chart/${encodedSymbol}?${rangeQueryParams}`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?${queryParams}`,
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?${rangeQueryParams}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?${queryParams}`,
    `https://query2.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?${rangeQueryParams}`,
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

        const timeStr =
          interval === '1d'
            ? d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
            : d.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

        candles.push({
          time: timeStr,
          timestamp: tsMs,
          isoString: d.toISOString(),
          open: Number(Number(o).toFixed(2)),
          high: Number(Number(h).toFixed(2)),
          low: Number(Number(l).toFixed(2)),
          close: Number(Number(c).toFixed(2)),
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
