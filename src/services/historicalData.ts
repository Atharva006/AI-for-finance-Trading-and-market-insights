import { Candle } from '../types/backtest';
import { NseStock, getYahooSymbol } from './nseStocks';
import { fetchUpstoxCandles } from './upstoxApi';

export type HistoricalDataProvider = 'yahoo' | 'upstox';
export type HistoricalRange = '300d' | '1y' | '3y' | '5y' | '10y' | 'max' | 'custom';

export interface FetchHistoricalDailyOptions {
  stock: NseStock;
  provider?: HistoricalDataProvider;
  range?: HistoricalRange;
  customFromDate?: string;
  customToDate?: string;
}

/**
 * Fetches free Daily historical data from starting / inception for any NSE Stock or Index.
 * Uses Yahoo Finance Historical Chart API via local Vite proxy / direct with zero rate limit.
 * Falls back seamlessly to Upstox multi-year daily data.
 */
export async function fetchHistoricalDailyCandles(
  options: FetchHistoricalDailyOptions
): Promise<Candle[]> {
  const provider = options.provider || 'yahoo';
  const range = options.range || 'max';
  const stock = options.stock;

  if (provider === 'yahoo') {
    try {
      const yahooCandles = await fetchYahooDailyCandles(stock, range, options.customFromDate, options.customToDate);
      if (yahooCandles && yahooCandles.length > 0) {
        return yahooCandles;
      }
    } catch (err) {
      console.warn(`[HistoricalData] Yahoo Finance fetch failed for ${stock.symbol}, falling back to Upstox:`, err);
    }
  }

  // Fallback / default to Upstox API
  return fetchUpstoxMultiYearCandles(stock, range, options.customFromDate, options.customToDate);
}

/**
 * Fetches Daily historical data from Yahoo Finance (Free from starting date)
 */
async function fetchYahooDailyCandles(
  stock: NseStock,
  range: HistoricalRange,
  customFromDate?: string,
  customToDate?: string
): Promise<Candle[]> {
  const yahooSymbol = getYahooSymbol(stock);
  const encodedSymbol = encodeURIComponent(yahooSymbol);

  // Determine period1 & period2 (seconds timestamp)
  const nowSec = Math.floor(Date.now() / 1000);
  let period1 = 0; // default 0 = from starting inception date (1996 / 2007)
  let period2 = nowSec;

  if (range === 'custom' && customFromDate) {
    period1 = Math.floor(new Date(customFromDate).getTime() / 1000);
    if (customToDate) {
      period2 = Math.floor(new Date(customToDate).getTime() / 1000) + 86400; // include end day
    }
  } else if (range === '300d') {
    period1 = nowSec - 300 * 24 * 3600;
  } else if (range === '1y') {
    period1 = nowSec - 365 * 24 * 3600;
  } else if (range === '3y') {
    period1 = nowSec - 3 * 365 * 24 * 3600;
  } else if (range === '5y') {
    period1 = nowSec - 5 * 365 * 24 * 3600;
  } else if (range === '10y') {
    period1 = nowSec - 10 * 365 * 24 * 3600;
  } else {
    // 'max' / all-time from starting
    period1 = 0;
  }

  const rangeParam = range === 'custom' ? '5y' : (range === '300d' ? '1y' : range);

  const urls: string[] = [];

  if (typeof window !== 'undefined') {
    urls.push(`/yahoo-api/v8/finance/chart/${encodedSymbol}?interval=1d&period1=${period1}&period2=${period2}`);
    urls.push(`/yahoo-api/v8/finance/chart/${encodedSymbol}?interval=1d&range=${rangeParam}`);
  }
  urls.push(`https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?interval=1d&period1=${period1}&period2=${period2}`);
  urls.push(`https://query1.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?interval=1d&range=${rangeParam}`);
  urls.push(`https://query2.finance.yahoo.com/v8/finance/chart/${encodedSymbol}?interval=1d&period1=${period1}&period2=${period2}`);

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
      });

      if (res.ok) {
        const json = await res.json();
        const result = json.chart?.result?.[0];
        if (!result) continue;

        const timestamps: number[] = result.timestamp || [];
        const quote = result.indicators?.quote?.[0] || {};
        const opens: (number | null)[] = quote.open || [];
        const highs: (number | null)[] = quote.high || [];
        const lows: (number | null)[] = quote.low || [];
        const closes: (number | null)[] = quote.close || [];
        const volumes: (number | null)[] = quote.volume || [];

        const candles: Candle[] = [];

        for (let i = 0; i < timestamps.length; i++) {
          const o = opens[i];
          const h = highs[i];
          const l = lows[i];
          const c = closes[i];
          const v = volumes[i] ?? 0;

          if (o == null || h == null || l == null || c == null) continue;

          const d = new Date(timestamps[i] * 1000);
          candles.push({
            time: d.toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            timestamp: timestamps[i] * 1000,
            isoString: d.toISOString(),
            open: Number(o.toFixed(2)),
            high: Number(h.toFixed(2)),
            low: Number(l.toFixed(2)),
            close: Number(c.toFixed(2)),
            volume: Math.round(v),
          });
        }

        if (candles.length > 0) {
          return candles;
        }
      }
    } catch (e) {
      console.warn(`[HistoricalData] Attempt failed on ${url}:`, e);
    }
  }

  throw new Error(`Failed to fetch Yahoo Finance data for ${stock.symbol}`);
}

/**
 * Fetches multi-year daily data from Upstox API
 */
async function fetchUpstoxMultiYearCandles(
  stock: NseStock,
  range: HistoricalRange,
  customFromDate?: string,
  customToDate?: string
): Promise<Candle[]> {
  const now = new Date();

  if (range === 'custom' && customFromDate) {
    return fetchUpstoxCandles({
      instrumentKey: stock.instrument_key,
      timeframe: '1d',
      fromDate: customFromDate,
      toDate: customToDate || now.toISOString().split('T')[0],
    });
  }

  let daysBack = 365;
  switch (range) {
    case '300d':
      daysBack = 300;
      break;
    case '1y':
      daysBack = 365;
      break;
    case '3y':
      daysBack = 3 * 365;
      break;
    case '5y':
      daysBack = 5 * 365;
      break;
    case '10y':
    case 'max':
    default:
      daysBack = 10 * 365; // Upstox allows up to 10 years directly
      break;
  }

  const fromDate = new Date(now.getTime() - daysBack * 24 * 3600 * 1000).toISOString().split('T')[0];
  const toDate = now.toISOString().split('T')[0];

  return fetchUpstoxCandles({
    instrumentKey: stock.instrument_key,
    timeframe: '1d',
    fromDate,
    toDate,
  });
}
