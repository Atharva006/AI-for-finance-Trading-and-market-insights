export interface NseStock {
  symbol: string;
  name: string;
  instrument_key: string;
  yahoo_symbol?: string;
  isIndex?: boolean;
  category?: 'INDEX' | 'LARGE_CAP' | 'MID_CAP' | 'SMALL_CAP' | 'EQUITY';
  last_price?: number;
}

export const ALL_NSE_INDICES: NseStock[] = [
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Benchmark Index',
    instrument_key: 'NSE_INDEX|Nifty 50',
    yahoo_symbol: '^NSEI',
    isIndex: true,
    category: 'INDEX',
    last_price: 25291.10,
  },
  {
    symbol: 'NIFTY BANK',
    name: 'NIFTY Bank Sectoral Index',
    instrument_key: 'NSE_INDEX|Nifty Bank',
    yahoo_symbol: '^NSEBANK',
    isIndex: true,
    category: 'INDEX',
    last_price: 61575.90,
  },
  {
    symbol: 'BANKNIFTY',
    name: 'NIFTY Bank Index (BANKNIFTY)',
    instrument_key: 'NSE_INDEX|Nifty Bank',
    yahoo_symbol: '^NSEBANK',
    isIndex: true,
    category: 'INDEX',
    last_price: 52400.00,
  },
  {
    symbol: 'FIN NIFTY',
    name: 'Nifty Financial Services Index',
    instrument_key: 'NSE_INDEX|Nifty Fin Service',
    yahoo_symbol: 'NIFTY_FIN_SERVICE.NS',
    isIndex: true,
    category: 'INDEX',
    last_price: 28015.40,
  },
  {
    symbol: 'NIFTY IT',
    name: 'NIFTY IT Sectoral Index',
    instrument_key: 'NSE_INDEX|Nifty IT',
    yahoo_symbol: '^CNXIT',
    isIndex: true,
    category: 'INDEX',
    last_price: 43250.80,
  },
  {
    symbol: 'NIFTY AUTO',
    name: 'NIFTY Auto Sectoral Index',
    instrument_key: 'NSE_INDEX|Nifty Auto',
    yahoo_symbol: '^CNXAUTO',
    isIndex: true,
    category: 'INDEX',
    last_price: 26180.40,
  },
  {
    symbol: 'NIFTY PHARMA',
    name: 'NIFTY Pharma Sectoral Index',
    instrument_key: 'NSE_INDEX|Nifty Pharma',
    yahoo_symbol: '^CNXPHARMA',
    isIndex: true,
    category: 'INDEX',
    last_price: 23140.20,
  },
  {
    symbol: 'NIFTY FMCG',
    name: 'NIFTY FMCG Sectoral Index',
    instrument_key: 'NSE_INDEX|Nifty FMCG',
    yahoo_symbol: '^CNXFMCG',
    isIndex: true,
    category: 'INDEX',
    last_price: 58920.60,
  },
  {
    symbol: 'NIFTY METAL',
    name: 'NIFTY Metal Sectoral Index',
    instrument_key: 'NSE_INDEX|Nifty Metal',
    yahoo_symbol: '^CNXMETAL',
    isIndex: true,
    category: 'INDEX',
    last_price: 9840.10,
  },
  {
    symbol: 'NIFTY MIDCAP 50',
    name: 'NIFTY Midcap 50 Index',
    instrument_key: 'NSE_INDEX|Nifty Midcap 50',
    yahoo_symbol: '^NSEMDCP50',
    isIndex: true,
    category: 'INDEX',
    last_price: 16750.30,
  },
  {
    symbol: 'NIFTY SMALLCAP 100',
    name: 'NIFTY Smallcap 100 Index',
    instrument_key: 'NSE_INDEX|Nifty Smallcap 100',
    yahoo_symbol: '^NSESMCAP',
    isIndex: true,
    category: 'INDEX',
    last_price: 19420.70,
  },
  {
    symbol: 'INDIA VIX',
    name: 'India Volatility Benchmark Index',
    instrument_key: 'NSE_INDEX|India VIX',
    yahoo_symbol: '^INDIAVIX',
    isIndex: true,
    category: 'INDEX',
    last_price: 15.68,
  },
];

export const POPULAR_NSE_STOCKS: NseStock[] = [
  ...ALL_NSE_INDICES,
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', instrument_key: 'NSE_EQ|INE002A01018', yahoo_symbol: 'RELIANCE.NS', isIndex: false, category: 'LARGE_CAP', last_price: 1336.60 },
  { symbol: 'AXISBANK', name: 'Axis Bank Ltd.', instrument_key: 'NSE_EQ|INE238A01034', yahoo_symbol: 'AXISBANK.NS', isIndex: false, category: 'LARGE_CAP', last_price: 1145.30 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', instrument_key: 'NSE_EQ|INE467B01029', yahoo_symbol: 'TCS.NS', isIndex: false, category: 'LARGE_CAP', last_price: 4140.50 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', instrument_key: 'NSE_EQ|INE040A01034', yahoo_symbol: 'HDFCBANK.NS', isIndex: false, category: 'LARGE_CAP', last_price: 1748.20 },
  { symbol: 'INFY', name: 'Infosys Ltd.', instrument_key: 'NSE_EQ|INE009A01021', yahoo_symbol: 'INFY.NS', isIndex: false, category: 'LARGE_CAP', last_price: 1865.10 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', instrument_key: 'NSE_EQ|INE090A01021', yahoo_symbol: 'ICICIBANK.NS', isIndex: false, category: 'LARGE_CAP', last_price: 1262.40 },
  { symbol: 'SBIN', name: 'State Bank of India', instrument_key: 'NSE_EQ|INE062A01020', yahoo_symbol: 'SBIN.NS', isIndex: false, category: 'LARGE_CAP', last_price: 842.15 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', instrument_key: 'NSE_EQ|INE155A01022', yahoo_symbol: 'TMPV.NS', isIndex: false, category: 'LARGE_CAP', last_price: 812.30 },
  { symbol: 'ITC', name: 'ITC Ltd.', instrument_key: 'NSE_EQ|INE154A01025', yahoo_symbol: 'ITC.NS', isIndex: false, category: 'LARGE_CAP', last_price: 472.90 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', instrument_key: 'NSE_EQ|INE397D01024', yahoo_symbol: 'BHARTIARTL.NS', isIndex: false, category: 'LARGE_CAP', last_price: 1612.00 },
  { symbol: 'LT', name: 'Larsen & Toubro Ltd.', instrument_key: 'NSE_EQ|INE018A01030', yahoo_symbol: 'LT.NS', isIndex: false, category: 'LARGE_CAP', last_price: 3620.50 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', instrument_key: 'NSE_EQ|INE585B01010', yahoo_symbol: 'MARUTI.NS', isIndex: false, category: 'LARGE_CAP', last_price: 12854.00 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', instrument_key: 'NSE_EQ|INE296A01024', yahoo_symbol: 'BAJFINANCE.NS', isIndex: false, category: 'LARGE_CAP', last_price: 6890.00 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', instrument_key: 'NSE_EQ|INE044A01036', yahoo_symbol: 'SUNPHARMA.NS', isIndex: false, category: 'LARGE_CAP', last_price: 1780.20 },
  { symbol: 'TATASTEEL', name: 'Tata Steel Ltd.', instrument_key: 'NSE_EQ|INE081A01020', yahoo_symbol: 'TATASTEEL.NS', isIndex: false, category: 'LARGE_CAP', last_price: 154.60 },
  { symbol: 'TITAN', name: 'Titan Company Ltd.', instrument_key: 'NSE_EQ|INE280A01028', yahoo_symbol: 'TITAN.NS', isIndex: false, category: 'LARGE_CAP', last_price: 3260.00 },
];

let cachedAllStocks: NseStock[] | null = null;

export async function fetchAllNseStocks(): Promise<NseStock[]> {
  if (cachedAllStocks && cachedAllStocks.length > 0) {
    return cachedAllStocks;
  }
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/data/nse_stocks.json');
      if (res.ok) {
        const data: NseStock[] = await res.json();
        cachedAllStocks = [
          ...ALL_NSE_INDICES,
          ...data.map((item) => ({
            ...item,
            isIndex: false,
            yahoo_symbol: item.yahoo_symbol || `${item.symbol}.NS`,
          })),
        ];
        return cachedAllStocks;
      }
    } else {
      // Node.js script / SSR environment
      try {
        const req = (globalThis as any).require;
        if (req) {
          const fs = req('fs');
          const path = req('path');
          const filePath = path.resolve(process.cwd(), 'public/data/nse_stocks.json');
          if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data: NseStock[] = JSON.parse(content);
            cachedAllStocks = [
              ...ALL_NSE_INDICES,
              ...data.map((item: any) => ({
                ...item,
                isIndex: false,
                yahoo_symbol: item.yahoo_symbol || `${item.symbol}.NS`,
              })),
            ];
            return cachedAllStocks;
          }
        }
      } catch (_) {}
    }
  } catch (e) {
    console.warn('Failed to load full NSE stocks json, using popular set:', e);
  }
  return POPULAR_NSE_STOCKS;
}

/**
 * Searches across all 3,400+ NSE stocks and indices by symbol or company name
 */
export async function searchNseStocks(query: string, limit = 50): Promise<NseStock[]> {
  const stocks = await fetchAllNseStocks();
  if (!query || query.trim() === '') {
    return stocks.slice(0, limit);
  }
  const q = query.trim().toUpperCase();
  return stocks
    .filter((s) => s.symbol.toUpperCase().includes(q) || s.name.toUpperCase().includes(q))
    .slice(0, limit);
}

/**
 * Finds any NSE stock by symbol or dynamically constructs a valid entry so fetching NEVER fails
 */
export async function findStockBySymbol(symbolOrQuery: string): Promise<NseStock> {
  const q = symbolOrQuery.trim().toUpperCase();
  
  // 1. Check indices first
  const indexMatch = ALL_NSE_INDICES.find(
    (idx) => idx.symbol.toUpperCase() === q || idx.instrument_key.toUpperCase() === q
  );
  if (indexMatch) return indexMatch;

  // 2. Check cached/loaded list
  const stocks = await fetchAllNseStocks();
  const match = stocks.find((s) => s.symbol.toUpperCase() === q);
  if (match) return match;

  // 3. Fallback: dynamically construct standard NSE equity definition
  const cleanSym = q.replace('.NS', '').replace('NSE:', '').trim();
  return {
    symbol: cleanSym,
    name: `${cleanSym} (NSE Listed)`,
    instrument_key: `NSE_EQ|${cleanSym}`,
    yahoo_symbol: `${cleanSym}.NS`,
    isIndex: false,
    category: 'EQUITY',
  };
}

export function getYahooSymbol(stock: NseStock): string {
  if (stock.yahoo_symbol) return stock.yahoo_symbol;
  const matchIndex = ALL_NSE_INDICES.find(
    (idx) => idx.symbol === stock.symbol || idx.instrument_key === stock.instrument_key
  );
  if (matchIndex && matchIndex.yahoo_symbol) return matchIndex.yahoo_symbol;
  const clean = stock.symbol.replace(/\s+/g, '');
  return `${clean}.NS`;
}
