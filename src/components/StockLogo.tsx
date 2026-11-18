import React, { useState } from 'react';

// ISIN lookup table for top NSE stocks to guarantee instant official logo loading from Groww CDN
export const STOCK_ISIN_MAP: Record<string, string> = {
  RELIANCE: 'INE002A01018',
  TCS: 'INE467B01029',
  HDFCBANK: 'INE040A01034',
  INFY: 'INE009A01021',
  ICICIBANK: 'INE090A01021',
  SBIN: 'INE062A01020',
  TATAMOTORS: 'INE155A01022',
  ITC: 'INE154A01025',
  BHARTIARTL: 'INE397D01024',
  LT: 'INE018A01030',
  MARUTI: 'INE585B01010',
  BAJFINANCE: 'INE296A01024',
  SUNPHARMA: 'INE044A01036',
  TATASTEEL: 'INE081A01020',
  TITAN: 'INE280A01028',
  WIPRO: 'INE075A01022',
  HCLTECH: 'INE860A01027',
  KOTAKBANK: 'INE237A01028',
  AXISBANK: 'INE238A01034',
  ADANIENT: 'INE423A01024',
  ASIANPAINT: 'INE021A01026',
  HINDUNILVR: 'INE030A01027',
  ULTRACEMCO: 'INE481G01011',
  NTPC: 'INE733E01010',
  POWERGRID: 'INE752E01010',
  BAJAJFINSV: 'INE918I01018',
  ONGC: 'INE213A01029',
  JSWSTEEL: 'INE019A01038',
  COALINDIA: 'INE522F01014',
  TECHM: 'INE669C01036',
  NESTLEIND: 'INE239A01016',
  GRASIM: 'INE047A01021',
  CIPLA: 'INE059A01026',
  DRREDDY: 'INE089A01023',
  APOLLOHOSP: 'INE437A01024',
  EICHERMOT: 'INE066A01013',
  DIVISLAB: 'INE361B01024',
  BPCL: 'INE029A01011',
  HEROMOTOCO: 'INE158A01026',
  BRITANNIA: 'INE216A01030',
  INDUSINDBK: 'INE095A01012',
  SHREECEM: 'INE070A01015',
  TRENT: 'INE849A01020',
  BEL: 'INE263A01024',
  HAL: 'INE066F01012',
  VEDL: 'INE205A01025',
  ZOMATO: 'INE758T01015',
  JIOFIN: 'INE758E01017',
  PAYTM: 'INE982J01020',
};

// Distinct brand color palettes for clean SVG vector fallbacks
const BRAND_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  RELIANCE: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  TCS: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  HDFCBANK: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
  INFY: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-300' },
  ICICIBANK: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
  SBIN: { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-300' },
  TATAMOTORS: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  ITC: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  BHARTIARTL: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  LT: { bg: 'bg-blue-50', text: 'text-blue-900', border: 'border-blue-300' },
  MARUTI: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  BAJFINANCE: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  SUNPHARMA: { bg: 'bg-yellow-50', text: 'text-amber-800', border: 'border-amber-200' },
  TATASTEEL: { bg: 'bg-slate-50', text: 'text-slate-800', border: 'border-slate-300' },
  TITAN: { bg: 'bg-emerald-50', text: 'text-emerald-900', border: 'border-emerald-200' },
};

interface StockLogoProps {
  symbol: string;
  instrumentKey?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export const StockLogo: React.FC<StockLogoProps> = ({
  symbol,
  instrumentKey,
  name,
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  // Normalize symbol
  const cleanSymbol = symbol.replace(/\.NS$/i, '').toUpperCase().trim();
  const isIndex =
    cleanSymbol.includes('NIFTY') ||
    cleanSymbol.includes('SENSEX') ||
    cleanSymbol.includes('BANK') ||
    cleanSymbol.includes('FIN');

  // Dimension classes
  const sizeMap = {
    xs: 'w-5 h-5 text-[9px] rounded-md',
    sm: 'w-6 h-6 text-[10px] rounded-lg',
    md: 'w-8 h-8 text-xs rounded-xl',
    lg: 'w-10 h-10 text-sm rounded-2xl',
  };

  const imgSizeMap = {
    xs: 'w-5 h-5 rounded-md',
    sm: 'w-6 h-6 rounded-lg',
    md: 'w-8 h-8 rounded-xl',
    lg: 'w-10 h-10 rounded-2xl',
  };

  // Determine ISIN: from instrumentKey (e.g. NSE_EQ|INE002A01018) or STOCK_ISIN_MAP
  let isin = '';
  if (instrumentKey && instrumentKey.includes('INE')) {
    const parts = instrumentKey.split('|');
    isin = parts[1] || parts[0];
  } else if (STOCK_ISIN_MAP[cleanSymbol]) {
    isin = STOCK_ISIN_MAP[cleanSymbol];
  }

  // If this is an NSE Index (NIFTY 50, NIFTY BANK, etc.), render official NSE insignia badge
  if (isIndex) {
    const isBank = cleanSymbol.includes('BANK');
    const isIT = cleanSymbol.includes('IT');
    const isFin = cleanSymbol.includes('FIN');
    const isAuto = cleanSymbol.includes('AUTO');
    const isPharma = cleanSymbol.includes('PHARMA');
    const isFmcg = cleanSymbol.includes('FMCG');

    let bgGrad = 'from-blue-600 to-indigo-800';
    let label = 'N50';
    if (isBank) {
      bgGrad = 'from-emerald-600 to-teal-800';
      label = 'BNK';
    } else if (isIT) {
      bgGrad = 'from-cyan-600 to-blue-800';
      label = 'IT';
    } else if (isFin) {
      bgGrad = 'from-violet-600 to-purple-800';
      label = 'FIN';
    } else if (isAuto) {
      bgGrad = 'from-amber-600 to-red-800';
      label = 'AUTO';
    } else if (isPharma) {
      bgGrad = 'from-emerald-500 to-green-700';
      label = 'RX';
    } else if (isFmcg) {
      bgGrad = 'from-teal-600 to-emerald-800';
      label = 'FMCG';
    }

    return (
      <div
        className={`${sizeMap[size]} bg-gradient-to-br ${bgGrad} text-white font-mono font-black flex items-center justify-center shadow-sm shrink-0 border border-white/20 select-none ${className}`}
        title={`NSE Benchmark Index · ${symbol}`}
      >
        <span className="tracking-tighter">{label}</span>
      </div>
    );
  }

  // Official Groww Verified Public CDN URL for Indian Stock Logos
  const logoUrl = isin
    ? `https://assets-netstorage.groww.in/stock-assets/logos/${isin}.png`
    : null;

  // If image URL is available and hasn't failed, render real brand PNG
  if (logoUrl && !imgError) {
    return (
      <div
        className={`${imgSizeMap[size]} shrink-0 bg-white border border-gray-200/80 shadow-sm flex items-center justify-center p-0.5 overflow-hidden select-none ${className}`}
      >
        <img
          src={logoUrl}
          alt={`${cleanSymbol} Logo`}
          className="w-full h-full object-contain rounded"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Fallback: Elegant crisp brand monogram with company initial
  const brand = BRAND_COLORS[cleanSymbol] || {
    bg: 'bg-neutral-100',
    text: 'text-neutral-800',
    border: 'border-neutral-200',
  };

  const initial = cleanSymbol.slice(0, 2);

  return (
    <div
      className={`${sizeMap[size]} ${brand.bg} ${brand.text} ${brand.border} border font-mono font-bold flex items-center justify-center shrink-0 shadow-sm select-none ${className}`}
      title={name || cleanSymbol}
    >
      <span className="tracking-tight">{initial}</span>
    </div>
  );
};
