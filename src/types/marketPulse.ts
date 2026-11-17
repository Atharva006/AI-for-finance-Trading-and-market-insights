export type MarketRegimeType =
  | 'CALM_TRENDING'
  | 'VOLATILE_CHOP'
  | 'HIGH_FEAR_BREAKDOWN'
  | 'ACCUMULATION_SQUEEZE';

export interface MarketPulseData {
  indiaVix: number;
  indiaVixChangePct: number;
  niftyAdvanceCount: number;
  niftyDeclineCount: number;
  marketBreadthPct: number; // % of NIFTY 50 above 50 EMA
  fiiNetFlowCr: number; // in ₹ Crores (Foreign Institutional Investors)
  diiNetFlowCr: number; // in ₹ Crores (Domestic Institutional Investors)
  regime: MarketRegimeType;
  regimeTitle: string;
  regimeDescription: string;
  recommendedStrategies: {
    name: string;
    fitLevel: 'OPTIMAL' | 'MODERATE' | 'CAUTION';
    reason: string;
  }[];
}

export interface FundamentalStockData {
  symbol: string;
  companyName: string;
  sector: string;
  marketCapCr: number;
  currentPrice: number;
  peRatio: number;
  industryPe: number;
  pbRatio: number;
  rocePct: number;
  roePct: number;
  debtToEquity: number;
  piotroskiFScore: number; // 0 to 9
  qtrRevenueGrowthPct: number; // YoY from latest corporate filings
  qtrProfitGrowthPct: number; // YoY from latest corporate filings
  nextEarningsDate: string; // ISO date
  daysToEarnings: number;
  earningsShieldActive: boolean; // True if within 3 days of earnings
  fundamentalGrade: 'A+' | 'A' | 'B' | 'C';
}

export interface MonteCarloResult {
  iterations: number;
  medianDrawdownPct: number;
  percentile90DrawdownPct: number;
  percentile95DrawdownPct: number;
  riskOfSevereDDPct: number; // Chance of DD > 12%
  simulatedPaths: { pathIndex: number; curve: number[] }[];
}

export interface InstitutionalRiskMetrics {
  annualizedSharpeRatio: number; // vs 6.5% G-Sec risk-free rate
  sortinoRatio: number; // Downside volatility penalized
  calmarRatio: number; // CAGR / Max DD
  profitFactor: number;
  expectancyPerTradeRs: number;
  averageHoldingPeriodBars: number;
  maxConsecutiveLosses: number;
}

export interface AIDiagnosticPrescription {
  category: 'RISK' | 'TIMING' | 'REGIME' | 'VOLATILITY';
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  observation: string;
  remedy: string;
}

export interface ConcallStatement {
  speaker: string;
  role: string;
  topic: string;
  statement: string;
  impact: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
}

export interface CompanyFilingDetails {
  quarter: string; // e.g. "Q2 FY25"
  filingDate: string;
  revenueCr: number;
  ebitdaMarginPct: number;
  patCr: number;
  concallHighlights: ConcallStatement[];
  capexGuidance: string;
  debtCommentary: string;
  keyRisks: string[];
}

export interface CompanyFilingAnalysis {
  symbol: string;
  companyName: string;
  confluenceScore: number; // 0 to 100
  clearanceStatus: 'APPROVED' | 'CAUTION' | 'RESTRICTED';
  executiveSummary: string;
  managementGuidanceVerdict: string;
  capexAndDebtOutlook: string;
  technicalSynergyNote: string;
  keyStrengths: string[];
  keyVulnerabilities: string[];
}
