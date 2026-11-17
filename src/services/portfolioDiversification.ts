import { StrategyBasket, BasketItem } from '../types/basket';
import { POPULAR_NSE_STOCKS, NseStock } from './nseStocks';
import { NSE_FUNDAMENTAL_STOCKS } from './marketPulseData';

export interface SectorExposure {
  sector: string;
  weightPct: number;
  stockCount: number;
  symbols: string[];
}

export interface DiversificationMetrics {
  score: number; // 0 to 100
  rating: 'EXCELLENT' | 'HEALTHY' | 'MODERATE' | 'CONCENTRATED';
  hhiIndex: number; // 0 to 10000 (Herfindahl-Hirschman Index)
  effectiveAssetCount: number;
  sectorBreakdown: SectorExposure[];
  topSectorRisk: string;
  correlationRiskNote: string;
}

export interface SuggestedDiversificationPair {
  id: string;
  type: 'SINGLE_STOCK' | 'PAIR';
  primaryStock: NseStock;
  secondaryStock?: NseStock;
  sector: string;
  recommendedStrategy: 'PSAR_SMA100' | 'OPENING_RANGE' | 'STOCHASTIC';
  recommendedRptPct: number;
  recommendedTimeframe: string;
  correlationWithBasket: number; // -1.0 to 1.0
  expectedScoreImprovement: number; // e.g. +14 pts
  rationale: string;
  headline: string;
}

// Historical pairwise correlation matrix for key NSE equities & benchmarks
const HISTORICAL_CORRELATIONS: Record<string, Record<string, number>> = {
  INFY: {
    INFY: 1.0,
    TCS: 0.84,
    RELIANCE: 0.32,
    HDFCBANK: 0.28,
    ICICIBANK: 0.31,
    TATAMOTORS: 0.22,
    LT: 0.29,
    BHARTIARTL: 0.18,
    ITC: 0.12,
    KOTAKBANK: 0.26,
    'Nifty 50': 0.65,
  },
  TCS: {
    INFY: 0.84,
    TCS: 1.0,
    RELIANCE: 0.35,
    HDFCBANK: 0.25,
    ICICIBANK: 0.29,
    TATAMOTORS: 0.19,
    LT: 0.27,
    BHARTIARTL: 0.16,
    ITC: 0.14,
    KOTAKBANK: 0.24,
    'Nifty 50': 0.62,
  },
  RELIANCE: {
    INFY: 0.32,
    TCS: 0.35,
    RELIANCE: 1.0,
    HDFCBANK: 0.44,
    ICICIBANK: 0.48,
    TATAMOTORS: 0.38,
    LT: 0.45,
    BHARTIARTL: 0.31,
    ITC: 0.22,
    KOTAKBANK: 0.41,
    'Nifty 50': 0.78,
  },
  HDFCBANK: {
    INFY: 0.28,
    TCS: 0.25,
    RELIANCE: 0.44,
    HDFCBANK: 1.0,
    ICICIBANK: 0.78,
    TATAMOTORS: 0.34,
    LT: 0.49,
    BHARTIARTL: 0.24,
    ITC: 0.21,
    KOTAKBANK: 0.74,
    'Nifty 50': 0.76,
  },
  ICICIBANK: {
    INFY: 0.31,
    TCS: 0.29,
    RELIANCE: 0.48,
    HDFCBANK: 0.78,
    ICICIBANK: 1.0,
    TATAMOTORS: 0.41,
    LT: 0.54,
    BHARTIARTL: 0.28,
    ITC: 0.19,
    KOTAKBANK: 0.72,
    'Nifty 50': 0.81,
  },
  TATAMOTORS: {
    INFY: 0.22,
    TCS: 0.19,
    RELIANCE: 0.38,
    HDFCBANK: 0.34,
    ICICIBANK: 0.41,
    TATAMOTORS: 1.0,
    LT: 0.48,
    BHARTIARTL: 0.26,
    ITC: 0.18,
    KOTAKBANK: 0.35,
    'Nifty 50': 0.58,
  },
  LT: {
    INFY: 0.29,
    TCS: 0.27,
    RELIANCE: 0.45,
    HDFCBANK: 0.49,
    ICICIBANK: 0.54,
    TATAMOTORS: 0.48,
    LT: 1.0,
    BHARTIARTL: 0.29,
    ITC: 0.25,
    KOTAKBANK: 0.46,
    'Nifty 50': 0.72,
  },
  BHARTIARTL: {
    INFY: 0.18,
    TCS: 0.16,
    RELIANCE: 0.31,
    HDFCBANK: 0.24,
    ICICIBANK: 0.28,
    TATAMOTORS: 0.26,
    LT: 0.29,
    BHARTIARTL: 1.0,
    ITC: 0.15,
    KOTAKBANK: 0.22,
    'Nifty 50': 0.48,
  },
  ITC: {
    INFY: 0.12,
    TCS: 0.14,
    RELIANCE: 0.22,
    HDFCBANK: 0.21,
    ICICIBANK: 0.19,
    TATAMOTORS: 0.18,
    LT: 0.25,
    BHARTIARTL: 0.15,
    ITC: 1.0,
    KOTAKBANK: 0.19,
    'Nifty 50': 0.39,
  },
  KOTAKBANK: {
    INFY: 0.26,
    TCS: 0.24,
    RELIANCE: 0.41,
    HDFCBANK: 0.74,
    ICICIBANK: 0.72,
    TATAMOTORS: 0.35,
    LT: 0.46,
    BHARTIARTL: 0.22,
    ITC: 0.19,
    KOTAKBANK: 1.0,
    'Nifty 50': 0.71,
  },
};

// Stock Sector Mapping
export function getStockSector(symbol: string): string {
  const fund = NSE_FUNDAMENTAL_STOCKS.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
  if (fund) return fund.sector;
  const sym = symbol.toUpperCase();
  if (sym.includes('NIFTY') || sym.includes('BANKNIFTY')) return 'Index Benchmark';
  if (sym === 'INFY' || sym === 'TCS' || sym === 'WIPRO' || sym === 'HCLTECH') return 'Information Technology';
  if (sym === 'HDFCBANK' || sym === 'ICICIBANK' || sym === 'SBIN' || sym === 'KOTAKBANK' || sym === 'AXISBANK') return 'Banking & Financials';
  if (sym === 'TATAMOTORS' || sym === 'M&M' || sym === 'MARUTI' || sym === 'BAJAJ-AUTO') return 'Automobile';
  if (sym === 'RELIANCE' || sym === 'ONGC' || sym === 'BPCL' || sym === 'IOC') return 'Energy & Conglomerate';
  if (sym === 'ITC' || sym === 'HINDUNILVR' || sym === 'NESTLEIND' || sym === 'BRITANNIA') return 'FMCG Defensive';
  if (sym === 'LT' || sym === 'ADANIENT' || sym === 'ULTRACEMCO') return 'Capital Goods & Infra';
  if (sym === 'BHARTIARTL') return 'Telecommunications';
  if (sym === 'SUNPHARMA' || sym === 'CIPLA' || sym === 'DRREDDY') return 'Pharmaceuticals';
  return 'Diversified Equities';
}

/**
 * Calculates portfolio diversification score, HHI concentration index, and sector breakdown
 */
export function calculateBasketDiversification(basket: StrategyBasket): DiversificationMetrics {
  const activeItems = basket.items.filter((it) => it.enabled);
  if (activeItems.length === 0) {
    return {
      score: 0,
      rating: 'CONCENTRATED',
      hhiIndex: 10000,
      effectiveAssetCount: 0,
      sectorBreakdown: [],
      topSectorRisk: 'No active assets',
      correlationRiskNote: 'Add assets across distinct sectors to begin diversification analysis.',
    };
  }

  // Calculate sector weights based on Risk Per Trade (RPT) allocation
  const totalRpt = activeItems.reduce((acc, it) => acc + (it.riskPerTradePct || 1), 0);
  const sectorMap: Record<string, { rpt: number; symbols: string[] }> = {};

  activeItems.forEach((it) => {
    const sec = getStockSector(it.stock.symbol);
    if (!sectorMap[sec]) {
      sectorMap[sec] = { rpt: 0, symbols: [] };
    }
    sectorMap[sec].rpt += it.riskPerTradePct || 1;
    if (!sectorMap[sec].symbols.includes(it.stock.symbol)) {
      sectorMap[sec].symbols.push(it.stock.symbol);
    }
  });

  const sectorBreakdown: SectorExposure[] = Object.entries(sectorMap).map(([sector, data]) => ({
    sector,
    weightPct: Number(((data.rpt / totalRpt) * 100).toFixed(1)),
    stockCount: data.symbols.length,
    symbols: data.symbols,
  }));

  // Sort sectors by weight descending
  sectorBreakdown.sort((a, b) => b.weightPct - a.weightPct);

  // Compute Herfindahl-Hirschman Index (HHI) = sum of squared percentage weights (0 to 10,000)
  const hhiIndex = Math.round(
    sectorBreakdown.reduce((acc, s) => acc + Math.pow(s.weightPct, 2), 0)
  );

  // Average pairwise correlation across active assets
  let correlationSum = 0;
  let correlationPairs = 0;
  for (let i = 0; i < activeItems.length; i++) {
    for (let j = i + 1; j < activeItems.length; j++) {
      const s1 = activeItems[i].stock.symbol.toUpperCase();
      const s2 = activeItems[j].stock.symbol.toUpperCase();
      const corr = HISTORICAL_CORRELATIONS[s1]?.[s2] ?? (getStockSector(s1) === getStockSector(s2) ? 0.75 : 0.28);
      correlationSum += corr;
      correlationPairs++;
    }
  }
  const avgCorrelation = correlationPairs > 0 ? correlationSum / correlationPairs : 1.0;

  // Base score from HHI (10,000 is 100% concentrated; 1,500 is very diversified)
  // Low HHI gives up to 60 pts
  let hhiScore = Math.max(0, Math.min(60, (1 - (hhiIndex - 1200) / 8800) * 60));

  // Asset count boost (up to 25 pts)
  const assetCountScore = Math.min(25, activeItems.length * 6);

  // Correlation penalty / bonus (up to 15 pts)
  const correlationBonus = Math.max(0, (1 - avgCorrelation) * 15);

  const rawScore = Math.round(hhiScore + assetCountScore + correlationBonus);
  const score = Math.min(98, Math.max(12, rawScore));

  let rating: DiversificationMetrics['rating'] = 'CONCENTRATED';
  if (score >= 80) rating = 'EXCELLENT';
  else if (score >= 65) rating = 'HEALTHY';
  else if (score >= 45) rating = 'MODERATE';

  const topSector = sectorBreakdown[0];
  const topSectorRisk =
    topSector && topSector.weightPct > 45
      ? `${topSector.sector} Concentration (${topSector.weightPct}% of Risk)`
      : 'Balanced Sector Distribution';

  let correlationRiskNote = 'High correlation risk; assets will drawdown simultaneously during sector selloffs.';
  if (avgCorrelation < 0.35) {
    correlationRiskNote = 'Low cross-asset correlation (~' + avgCorrelation.toFixed(2) + '); portfolio exhibits strong shock-absorber resilience.';
  } else if (avgCorrelation < 0.6) {
    correlationRiskNote = 'Moderate cross-asset correlation (~' + avgCorrelation.toFixed(2) + '); good beta balance with room for defensive hedging.';
  }

  return {
    score,
    rating,
    hhiIndex,
    effectiveAssetCount: activeItems.length,
    sectorBreakdown,
    topSectorRisk,
    correlationRiskNote,
  };
}

/**
 * Intelligent Diversification Suggester:
 * Suggests uncorrelated assets and pairs that fill the basket's sector voids and lower portfolio variance.
 */
export function getSuggestedDiversificationAdditions(
  basket: StrategyBasket
): SuggestedDiversificationPair[] {
  const currentSymbols = new Set(
    basket.items.filter((it) => it.enabled).map((it) => it.stock.symbol.toUpperCase())
  );
  const currentSectors = new Set(
    basket.items.filter((it) => it.enabled).map((it) => getStockSector(it.stock.symbol))
  );

  const suggestions: SuggestedDiversificationPair[] = [];

  // Suggestion 1: FMCG Defensive Hedge (ITC) if no FMCG present
  if (!currentSectors.has('FMCG Defensive') && !currentSymbols.has('ITC')) {
    const itcStock = POPULAR_NSE_STOCKS.find((s) => s.symbol === 'ITC') || {
      symbol: 'ITC',
      name: 'ITC Limited',
      instrument_key: 'NSE_EQ|INE154A01025',
      yahoo_symbol: 'ITC.NS',
      isIndex: false,
    };
    suggestions.push({
      id: 'sugg-itc-hedge',
      type: 'SINGLE_STOCK',
      primaryStock: itcStock,
      sector: 'FMCG Defensive',
      recommendedStrategy: 'PSAR_SMA100',
      recommendedRptPct: 1.0,
      recommendedTimeframe: '1d',
      correlationWithBasket: 0.16,
      expectedScoreImprovement: 18,
      headline: 'ITC (FMCG Defensive Cash-Cow)',
      rationale:
        'Zero debt, 38.5% ROCE, and ultra-low correlation (0.16) to IT/Banking. Protects equity curve during market selloffs while providing steady trend capture.',
    });
  }

  // Suggestion 2: Private Banking Core (HDFCBANK or ICICIBANK) if under-allocated in financials
  if (!currentSectors.has('Banking & Financials') && !currentSymbols.has('HDFCBANK')) {
    const hdfc = POPULAR_NSE_STOCKS.find((s) => s.symbol === 'HDFCBANK') || {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank Limited',
      instrument_key: 'NSE_EQ|INE040A01034',
      yahoo_symbol: 'HDFCBANK.NS',
      isIndex: false,
    };
    suggestions.push({
      id: 'sugg-hdfc-core',
      type: 'SINGLE_STOCK',
      primaryStock: hdfc,
      sector: 'Banking & Financials',
      recommendedStrategy: 'OPENING_RANGE',
      recommendedRptPct: 1.2,
      recommendedTimeframe: '5m',
      correlationWithBasket: 0.32,
      expectedScoreImprovement: 15,
      headline: 'HDFC Bank (Institutional Liquidity)',
      rationale:
        'Highest weight in Bank Nifty. High intraday volume generates clean Opening Range Breakouts (ORB) that perform independent of IT swings.',
    });
  }

  // Suggestion 3: Infrastructure & Capital Goods (L&T)
  if (!currentSectors.has('Capital Goods & Infra') && !currentSymbols.has('LT')) {
    const lt = POPULAR_NSE_STOCKS.find((s) => s.symbol === 'LT') || {
      symbol: 'LT',
      name: 'Larsen & Toubro Limited',
      instrument_key: 'NSE_EQ|INE018A01030',
      yahoo_symbol: 'LT.NS',
      isIndex: false,
    };
    suggestions.push({
      id: 'sugg-lt-infra',
      type: 'SINGLE_STOCK',
      primaryStock: lt,
      sector: 'Capital Goods & Infra',
      recommendedStrategy: 'PSAR_SMA100',
      recommendedRptPct: 1.0,
      recommendedTimeframe: '1d',
      correlationWithBasket: 0.28,
      expectedScoreImprovement: 14,
      headline: 'Larsen & Toubro (Capex Cycle Proxy)',
      rationale:
        '₹5.1 Lakh Cr record order book. Moves with domestic government & Middle-East infrastructure cycles rather than tech valuations.',
    });
  }

  // Suggestion 4: High-Beta Auto (TATAMOTORS) for Momentum Expansion
  if (!currentSectors.has('Automobile') && !currentSymbols.has('TATAMOTORS')) {
    const tata = POPULAR_NSE_STOCKS.find((s) => s.symbol === 'TATAMOTORS') || {
      symbol: 'TATAMOTORS',
      name: 'Tata Motors Limited',
      instrument_key: 'NSE_EQ|INE155A01022',
      yahoo_symbol: 'TATAMOTORS.NS',
      isIndex: false,
    };
    suggestions.push({
      id: 'sugg-tata-auto',
      type: 'SINGLE_STOCK',
      primaryStock: tata,
      sector: 'Automobile',
      recommendedStrategy: 'STOCHASTIC',
      recommendedRptPct: 0.8,
      recommendedTimeframe: '1h',
      correlationWithBasket: 0.24,
      expectedScoreImprovement: 12,
      headline: 'Tata Motors (Auto Momentum & EV)',
      rationale:
        'High beta auto trend with JLR cash flow turnaround. Adding 0.8% RPT captures cyclical auto rallies without excessive portfolio drawdown.',
    });
  }

  // Suggestion 5: Pair Diversification: INFY + ITC or TCS + BHARTIARTL
  if (!currentSymbols.has('BHARTIARTL') && currentSymbols.has('INFY')) {
    const airtel = POPULAR_NSE_STOCKS.find((s) => s.symbol === 'BHARTIARTL') || {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel Limited',
      instrument_key: 'NSE_EQ|INE397D01024',
      yahoo_symbol: 'BHARTIARTL.NS',
      isIndex: false,
    };
    suggestions.push({
      id: 'sugg-pair-airtel',
      type: 'SINGLE_STOCK',
      primaryStock: airtel,
      sector: 'Telecommunications',
      recommendedStrategy: 'PSAR_SMA100',
      recommendedRptPct: 1.0,
      recommendedTimeframe: '1d',
      correlationWithBasket: 0.18,
      expectedScoreImprovement: 16,
      headline: 'Bharti Airtel (Telecom Recurring ARPU)',
      rationale:
        'Non-cyclical digital utility business with 52.8% EBITDA margins. Correlation to software exporters is under 0.20.',
    });
  }

  return suggestions.slice(0, 3);
}
