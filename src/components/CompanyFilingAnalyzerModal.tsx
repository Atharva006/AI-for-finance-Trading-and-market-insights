import React, { useState, useEffect } from 'react';
import {
  FileText,
  Building2,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  X,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Sliders,
  Quote,
  Layers,
} from 'lucide-react';
import {
  FundamentalStockData,
  CompanyFilingDetails,
  CompanyFilingAnalysis,
} from '../types/marketPulse';
import {
  getStockFilingDetails,
} from '../services/marketPulseData';
import {
  groqAnalyzeCompanyFiling,
  generateFallbackFilingAnalysis,
} from '../services/groqApi';

interface CompanyFilingAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: FundamentalStockData | null;
  onSelectForBacktest?: (symbol: string) => void;
}

export const CompanyFilingAnalyzerModal: React.FC<CompanyFilingAnalyzerModalProps> = ({
  isOpen,
  onClose,
  stock,
  onSelectForBacktest,
}) => {
  const [analysis, setAnalysis] = useState<CompanyFilingAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const filing = stock ? getStockFilingDetails(stock.symbol) : null;

  const runAnalysis = async () => {
    if (!stock || !filing) return;
    setIsLoading(true);
    try {
      const res = await groqAnalyzeCompanyFiling(stock, filing);
      setAnalysis(res);
    } catch (err) {
      console.warn('Groq filing analysis failed:', err);
      setAnalysis(generateFallbackFilingAnalysis(stock, filing));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stock && filing) {
      // Initialize with deterministic fallback first so UI is instant, then fetch live Groq
      setAnalysis(generateFallbackFilingAnalysis(stock, filing));
      runAnalysis();
    } else {
      setAnalysis(null);
    }
  }, [isOpen, stock?.symbol]);

  if (!isOpen || !stock || !filing) return null;

  const currentAnalysis = analysis || generateFallbackFilingAnalysis(stock, filing);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl xl:max-w-6xl w-full max-h-[94vh] overflow-y-auto shadow-2xl border border-gray-200 p-6 sm:p-8 space-y-6 animate-in fade-in duration-200 select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                  SEBI LODR Quarterly Filing &amp; Earnings Concall Deep-Dive
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {filing.quarter}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A0A0D] tracking-tight">
                {stock.companyName} ({stock.symbol})
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                currentAnalysis.clearanceStatus === 'APPROVED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : currentAnalysis.clearanceStatus === 'CAUTION'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {currentAnalysis.clearanceStatus === 'APPROVED'
                  ? 'Algo Clearance: Approved'
                  : currentAnalysis.clearanceStatus === 'CAUTION'
                  ? 'Algo Clearance: Caution'
                  : 'Algo Clearance: Restricted'}
              </span>
              <span className="bg-white px-1.5 py-0.2 rounded border border-current text-[10px]">
                {currentAnalysis.confluenceScore}/100
              </span>
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section 1: Financial Telemetry & Piotroski Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Quarterly Financial Highlights ({filing.quarter})</span>
            </h3>
            <span className="text-[11px] font-mono text-gray-400">Filed on {filing.filingDate}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Revenue</span>
              <span className="text-base font-bold text-black mt-0.5 block">
                ₹{filing.revenueCr.toLocaleString('en-IN')} Cr
              </span>
              <span className="text-[10px] text-emerald-600 block">
                +{stock.qtrRevenueGrowthPct}% YoY Growth
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">EBITDA Margin</span>
              <span className="text-base font-bold text-black mt-0.5 block">
                {filing.ebitdaMarginPct}%
              </span>
              <span className="text-[10px] text-gray-500 block">
                PAT: ₹{filing.patCr.toLocaleString('en-IN')} Cr
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">ROCE & D/E</span>
              <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                {stock.rocePct}% ROCE
              </span>
              <span className="text-[10px] text-gray-500 block">
                D/E: {stock.debtToEquity} ({stock.debtToEquity < 0.5 ? 'Low Leverage' : 'Moderate'})
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Piotroski F-Score</span>
              <span className="text-base font-bold text-black mt-0.5 block">
                {stock.piotroskiFScore}/9 Points
              </span>
              <span className="text-[10px] text-emerald-600 block">
                {stock.piotroskiFScore >= 8 ? 'Exceptional Health' : 'Stable Financials'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Concall Transcript Highlights */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Quote className="w-4 h-4 text-blue-600" />
              <span>Earnings Call Transcript Highlights (CEO & CFO Commentary)</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {filing.concallHighlights.map((quote, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black">{quote.speaker}</span>
                    <span className="text-[10px] text-gray-500 font-mono">({quote.role})</span>
                    <span className="px-2 py-0.2 rounded bg-white text-gray-700 border border-gray-200 text-[10px] font-mono font-bold">
                      {quote.topic}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold ${
                      quote.impact === 'POSITIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : quote.impact === 'NEGATIVE'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {quote.impact}
                  </span>
                </div>
                <p className="text-xs text-gray-700 italic font-sans leading-relaxed">
                  "{quote.statement}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Quantitative Fundamental Confluence Verdict */}
        <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-black">
                Quantitative Fundamental Confluence Analysis
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-emerald-800 hidden sm:inline">
                Institutional Quant Intelligence
              </span>
              <button
                onClick={runAnalysis}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-white border border-emerald-300 hover:bg-emerald-100 text-[11px] font-mono text-emerald-900 flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isLoading ? 'animate-spin text-emerald-600' : 'text-emerald-700'}`}
                />
                <span>{isLoading ? 'Synthesizing...' : 'Re-Analyze with AI'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2 text-xs font-sans text-gray-800 leading-relaxed">
            <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
              <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
                Executive Synthesis
              </span>
              <p className="text-gray-700">{currentAnalysis.executiveSummary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-sans">
              <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
                  Management Guidance Outlook
                </span>
                <p className="text-gray-700 text-xs">{currentAnalysis.managementGuidanceVerdict}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-100 space-y-1">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase block">
                  Capex & Balance Sheet Leverage
                </span>
                <p className="text-gray-700 text-xs">{currentAnalysis.capexAndDebtOutlook}</p>
              </div>
            </div>

            {/* Technical Synergy Note */}
            <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-300/80 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-900 block">
                  Quantitative Strategy Synergy
                </span>
                <p className="text-xs text-emerald-950 font-sans mt-0.5">
                  {currentAnalysis.technicalSynergyNote}
                </p>
              </div>
            </div>

            {/* Strengths & Risks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">
                  Key Fundamental Strengths:
                </span>
                <ul className="space-y-1 text-[11px] text-gray-700">
                  {currentAnalysis.keyStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-rose-800 uppercase block">
                  Filing & Macro Vulnerabilities:
                </span>
                <ul className="space-y-1 text-[11px] text-gray-700">
                  {currentAnalysis.keyVulnerabilities.map((vuln, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{vuln}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-gray-500">
            Next Earnings Event: <strong>{stock.nextEarningsDate}</strong> ({stock.daysToEarnings} days away)
          </div>

          <div className="flex items-center gap-2">
            {onSelectForBacktest && (
              <button
                onClick={() => {
                  onSelectForBacktest(stock.symbol);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Backtest Strategy ({stock.symbol})</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
