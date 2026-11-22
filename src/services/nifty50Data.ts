export interface Nifty50Constituent {
  symbol: string;
  name: string;
  sector: string;
  weight: number; // approximate benchmark weight (%)
  instrument_key: string;
  yahoo_symbol: string;
  lastPrice?: number;
  change?: number;
  pChange?: number;
  marketCapCr?: number;
}

export const ALL_NIFTY_50_STOCKS: Nifty50Constituent[] = [
  // ── Banking & Financial Services ──
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financial Services', weight: 11.8, instrument_key: 'NSE_EQ|INE040A01034', yahoo_symbol: 'HDFCBANK.NS' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financial Services', weight: 8.5, instrument_key: 'NSE_EQ|INE090A01021', yahoo_symbol: 'ICICIBANK.NS' },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', sector: 'Financial Services', weight: 3.4, instrument_key: 'NSE_EQ|INE238A01034', yahoo_symbol: 'AXISBANK.NS' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Financial Services', weight: 2.8, instrument_key: 'NSE_EQ|INE237A01028', yahoo_symbol: 'KOTAKBANK.NS' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services', weight: 3.2, instrument_key: 'NSE_EQ|INE062A01020', yahoo_symbol: 'SBIN.NS' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank Ltd.', sector: 'Financial Services', weight: 1.1, instrument_key: 'NSE_EQ|INE095A01012', yahoo_symbol: 'INDUSINDBK.NS' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services', weight: 2.4, instrument_key: 'NSE_EQ|INE296A01024', yahoo_symbol: 'BAJFINANCE.NS' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv Ltd.', sector: 'Financial Services', weight: 1.1, instrument_key: 'NSE_EQ|INE918I01026', yahoo_symbol: 'BAJAJFINSV.NS' },
  { symbol: 'HDFCLIFE', name: 'HDFC Life Insurance Co. Ltd.', sector: 'Financial Services', weight: 0.8, instrument_key: 'NSE_EQ|INE795G01014', yahoo_symbol: 'HDFCLIFE.NS' },
  { symbol: 'SBILIFE', name: 'SBI Life Insurance Co. Ltd.', sector: 'Financial Services', weight: 0.9, instrument_key: 'NSE_EQ|INE123W01016', yahoo_symbol: 'SBILIFE.NS' },
  { symbol: 'SHRIRAMFIN', name: 'Shriram Finance Ltd.', sector: 'Financial Services', weight: 1.1, instrument_key: 'NSE_EQ|INE721A01013', yahoo_symbol: 'SHRIRAMFIN.NS' },

  // ── Information Technology ──
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Information Technology', weight: 3.8, instrument_key: 'NSE_EQ|INE467B01029', yahoo_symbol: 'TCS.NS' },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Information Technology', weight: 6.2, instrument_key: 'NSE_EQ|INE009A01021', yahoo_symbol: 'INFY.NS' },
  { symbol: 'HCLTECH', name: 'HCL Technologies Ltd.', sector: 'Information Technology', weight: 1.8, instrument_key: 'NSE_EQ|INE860A01027', yahoo_symbol: 'HCLTECH.NS' },
  { symbol: 'TECHM', name: 'Tech Mahindra Ltd.', sector: 'Information Technology', weight: 1.1, instrument_key: 'NSE_EQ|INE669C01036', yahoo_symbol: 'TECHM.NS' },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Information Technology', weight: 0.8, instrument_key: 'NSE_EQ|INE075A01022', yahoo_symbol: 'WIPRO.NS' },

  // ── Oil, Gas & Consumable Fuels ──
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy & Petrochemicals', weight: 8.9, instrument_key: 'NSE_EQ|INE002A01018', yahoo_symbol: 'RELIANCE.NS' },
  { symbol: 'ONGC', name: 'Oil & Natural Gas Corp. Ltd.', sector: 'Energy & Petrochemicals', weight: 1.2, instrument_key: 'NSE_EQ|INE213A01029', yahoo_symbol: 'ONGC.NS' },
  { symbol: 'BPCL', name: 'Bharat Petroleum Corp. Ltd.', sector: 'Energy & Petrochemicals', weight: 0.7, instrument_key: 'NSE_EQ|INE029A01011', yahoo_symbol: 'BPCL.NS' },
  { symbol: 'COALINDIA', name: 'Coal India Ltd.', sector: 'Energy & Petrochemicals', weight: 1.1, instrument_key: 'NSE_EQ|INE522F01014', yahoo_symbol: 'COALINDIA.NS' },

  // ── Automobiles & Auto Components ──
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automobile', weight: 1.9, instrument_key: 'NSE_EQ|INE155A01022', yahoo_symbol: 'TATAMOTORS.NS' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automobile', weight: 1.7, instrument_key: 'NSE_EQ|INE585B01010', yahoo_symbol: 'MARUTI.NS' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra Ltd.', sector: 'Automobile', weight: 2.4, instrument_key: 'NSE_EQ|INE101A01026', yahoo_symbol: 'M&M.NS' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto Ltd.', sector: 'Automobile', weight: 1.2, instrument_key: 'NSE_EQ|INE917I01012', yahoo_symbol: 'BAJAJ-AUTO.NS' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors Ltd.', sector: 'Automobile', weight: 0.8, instrument_key: 'NSE_EQ|INE066A01021', yahoo_symbol: 'EICHERMOT.NS' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp Ltd.', sector: 'Automobile', weight: 0.7, instrument_key: 'NSE_EQ|INE158A01026', yahoo_symbol: 'HEROMOTOCO.NS' },

  // ── Fast Moving Consumer Goods (FMCG) ──
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'Consumer Goods', weight: 3.9, instrument_key: 'NSE_EQ|INE154A01025', yahoo_symbol: 'ITC.NS' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'Consumer Goods', weight: 2.2, instrument_key: 'NSE_EQ|INE030A01027', yahoo_symbol: 'HINDUNILVR.NS' },
  { symbol: 'NESTLEIND', name: 'Nestle India Ltd.', sector: 'Consumer Goods', weight: 0.9, instrument_key: 'NSE_EQ|INE239A01024', yahoo_symbol: 'NESTLEIND.NS' },
  { symbol: 'BRITANNIA', name: 'Britannia Industries Ltd.', sector: 'Consumer Goods', weight: 0.8, instrument_key: 'NSE_EQ|INE216A01030', yahoo_symbol: 'BRITANNIA.NS' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer Products Ltd.', sector: 'Consumer Goods', weight: 0.8, instrument_key: 'NSE_EQ|INE192A01025', yahoo_symbol: 'TATACONSUM.NS' },

  // ── Healthcare & Pharmaceuticals ──
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', sector: 'Healthcare', weight: 1.8, instrument_key: 'NSE_EQ|INE044A01036', yahoo_symbol: 'SUNPHARMA.NS' },
  { symbol: 'CIPLA', name: 'Cipla Ltd.', sector: 'Healthcare', weight: 0.9, instrument_key: 'NSE_EQ|INE059A01026', yahoo_symbol: 'CIPLA.NS' },
  { symbol: 'DRREDDY', name: "Dr. Reddy's Laboratories Ltd.", sector: 'Healthcare', weight: 0.8, instrument_key: 'NSE_EQ|INE089A01023', yahoo_symbol: 'DRREDDY.NS' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals Enterprise Ltd.', sector: 'Healthcare', weight: 0.8, instrument_key: 'NSE_EQ|INE437A01024', yahoo_symbol: 'APOLLOHOSP.NS' },

  // ── Metals & Mining ──
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', sector: 'Metals & Mining', weight: 1.1, instrument_key: 'NSE_EQ|INE081A01020', yahoo_symbol: 'TATASTEEL.NS' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel Ltd.', sector: 'Metals & Mining', weight: 1.0, instrument_key: 'NSE_EQ|INE019A01038', yahoo_symbol: 'JSWSTEEL.NS' },
  { symbol: 'HINDALCO', name: 'Hindalco Industries Ltd.', sector: 'Metals & Mining', weight: 1.0, instrument_key: 'NSE_EQ|INE038A01020', yahoo_symbol: 'HINDALCO.NS' },

  // ── Power & Utilities ──
  { symbol: 'NTPC', name: 'NTPC Ltd.', sector: 'Power & Utilities', weight: 1.7, instrument_key: 'NSE_EQ|INE733E01010', yahoo_symbol: 'NTPC.NS' },
  { symbol: 'POWERGRID', name: 'Power Grid Corporation of India Ltd.', sector: 'Power & Utilities', weight: 1.3, instrument_key: 'NSE_EQ|INE752E01010', yahoo_symbol: 'POWERGRID.NS' },

  // ── Construction & Infrastructure ──
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', sector: 'Construction', weight: 3.8, instrument_key: 'NSE_EQ|INE018A01030', yahoo_symbol: 'LT.NS' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement Ltd.', sector: 'Construction Materials', weight: 1.2, instrument_key: 'NSE_EQ|INE481G01011', yahoo_symbol: 'ULTRACEMCO.NS' },
  { symbol: 'GRASIM', name: 'Grasim Industries Ltd.', sector: 'Construction Materials', weight: 0.8, instrument_key: 'NSE_EQ|INE047A01021', yahoo_symbol: 'GRASIM.NS' },

  // ── Telecommunications & Defense ──
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Telecommunication', weight: 3.6, instrument_key: 'NSE_EQ|INE397D01024', yahoo_symbol: 'BHARTIARTL.NS' },
  { symbol: 'BEL', name: 'Bharat Electronics Ltd.', sector: 'Aerospace & Defense', weight: 1.2, instrument_key: 'NSE_EQ|INE263A01024', yahoo_symbol: 'BEL.NS' },

  // ── Conglomerate & Retail ──
  { symbol: 'ADANIENT', name: 'Adani Enterprises Ltd.', sector: 'Metals & Services', weight: 0.9, instrument_key: 'NSE_EQ|INE423A01024', yahoo_symbol: 'ADANIENT.NS' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports & SEZ Ltd.', sector: 'Services & Infrastructure', weight: 1.1, instrument_key: 'NSE_EQ|INE742F01042', yahoo_symbol: 'ADANIPORTS.NS' },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', sector: 'Consumer Durables', weight: 1.4, instrument_key: 'NSE_EQ|INE280A01028', yahoo_symbol: 'TITAN.NS' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Consumer Durables', weight: 1.3, instrument_key: 'NSE_EQ|INE021A01026', yahoo_symbol: 'ASIANPAINT.NS' },
  { symbol: 'TRENT', name: 'Trent Ltd.', sector: 'Retail & Consumer Services', weight: 1.4, instrument_key: 'NSE_EQ|INE849A01020', yahoo_symbol: 'TRENT.NS' },
];

/**
 * Sector buckets for NIFTY 50 breakdown
 */
export const NIFTY_50_SECTORS = [
  'All Sectors',
  'Financial Services',
  'Information Technology',
  'Energy & Petrochemicals',
  'Automobile',
  'Consumer Goods',
  'Healthcare',
  'Metals & Mining',
  'Power & Utilities',
  'Construction',
  'Telecommunication',
  'Consumer Durables',
];

/**
 * In-memory quote cache
 */
const nifty50QuoteCache = new Map<string, { lastPrice: number; change: number; pChange: number; timestamp: number }>();

/**
 * Fetches authentic live quote details for NIFTY 50 constituents from Yahoo Finance
 */
export async function fetchNifty50LiveQuotes(): Promise<Nifty50Constituent[]> {
  const symbols = ALL_NIFTY_50_STOCKS.map((s) => s.yahoo_symbol).join(',');
  const encoded = encodeURIComponent(symbols);

  const urls = [
    `/yahoo-api/v7/finance/quote?symbols=${encoded}`,
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encoded}`,
    `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${encoded}`,
  ];

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
        const results = json.quoteResponse?.result || [];
        const resultMap = new Map<string, any>();
        results.forEach((r: any) => resultMap.set(r.symbol, r));

        return ALL_NIFTY_50_STOCKS.map((stock) => {
          const q = resultMap.get(stock.yahoo_symbol);
          if (q) {
            const lastPrice = q.regularMarketPrice || q.price || stock.lastPrice || 0;
            const change = q.regularMarketChange || 0;
            const pChange = q.regularMarketChangePercent || 0;
            nifty50QuoteCache.set(stock.symbol, {
              lastPrice,
              change,
              pChange,
              timestamp: Date.now(),
            });
            return {
              ...stock,
              lastPrice: Number(lastPrice.toFixed(2)),
              change: Number(change.toFixed(2)),
              pChange: Number(pChange.toFixed(2)),
              marketCapCr: q.marketCap ? Math.round(q.marketCap / 10000000) : undefined,
            };
          }
          return stock;
        });
      }
    } catch (_) {}
  }

  // Fallback to cache or base list
  return ALL_NIFTY_50_STOCKS.map((stock) => {
    const cached = nifty50QuoteCache.get(stock.symbol);
    if (cached) {
      return {
        ...stock,
        lastPrice: cached.lastPrice,
        change: cached.change,
        pChange: cached.pChange,
      };
    }
    return stock;
  });
}
