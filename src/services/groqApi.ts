import { ParsedStrategyPrompt, parseNaturalLanguageStrategy } from './aiPromptParser';
import { generateAIDiagnostics } from './strategyDoctor';
import {
  InstitutionalRiskMetrics,
  MonteCarloResult,
  AIDiagnosticPrescription,
  MarketPulseData,
  FundamentalStockData,
  CompanyFilingDetails,
  CompanyFilingAnalysis,
} from '../types/marketPulse';
import { Trade } from '../types/backtest';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
export const PROMPT_GUARD_MODEL = 'meta-llama/llama-prompt-guard-2-86m';
export const DEFAULT_GENERATION_MODEL = 'openai/gpt-oss-120b';

export function getGroqApiKey(): string {
  const envKey = import.meta.env.VITE_GROQ_API_KEY;
  const localKey = localStorage.getItem('arjuna_groq_api_key');
  return (localKey || envKey || '').trim();
}

export function setGroqApiKey(key: string): void {
  localStorage.setItem('arjuna_groq_api_key', key.trim());
}

export function getGroqModel(): string {
  const envModel = import.meta.env.VITE_GROQ_MODEL;
  const localModel = localStorage.getItem('arjuna_groq_model');
  const chosen = (localModel || envModel || DEFAULT_GENERATION_MODEL).trim();
  // Ensure prompt guard is never used as a generative text model
  return chosen === PROMPT_GUARD_MODEL ? DEFAULT_GENERATION_MODEL : chosen;
}

export function setGroqModel(model: string): void {
  localStorage.setItem('arjuna_groq_model', model.trim());
}

/**
 * Run input through Meta's Llama Prompt Guard 2 (86M) on Groq
 * Evaluates prompt injection, jailbreak attempts, and security risk.
 * Returns risk score (0.00 to 1.00) and whether the input is safe (< 0.50).
 */
export async function groqCheckPromptGuard(
  prompt: string
): Promise<{ score: number; isSafe: boolean; raw: string }> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    return { score: 0, isSafe: true, raw: '0.0' };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: PROMPT_GUARD_MODEL,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.warn('Groq Prompt Guard call returned status:', response.status);
      return { score: 0, isSafe: true, raw: '0.0' };
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || '0.0';
    const parsedScore = parseFloat(rawContent.trim());
    const score = isNaN(parsedScore) ? 0 : parsedScore;
    return { score, isSafe: score < 0.5, raw: rawContent };
  } catch (err) {
    console.warn('Groq Prompt Guard check error:', err);
    return { score: 0, isSafe: true, raw: '0.0' };
  }
}

/**
 * Low-level chat completion wrapper calling Groq with high-speed LPU reasoning models
 */
async function callGroqChat(
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
  jsonMode = false,
  maxTokens = 2048
): Promise<string> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Groq API Key not configured. Please provide a valid key.');
  }

  const configuredModel = getGroqModel();
  
  // High-performance Groq LPU models (openai/gpt-oss-120b is the primary 120B reasoning powerhouse)
  const candidateModels = [
    configuredModel,
    DEFAULT_GENERATION_MODEL,
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-20b',
    'allam-2-7b',
  ].filter((m, i, arr) => m && m !== PROMPT_GUARD_MODEL && arr.indexOf(m) === i);
    
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: maxTokens,
          temperature: 0.2,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {}),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = new Error(`Groq API Error (${response.status} on ${model}): ${errText}`);
        continue;
      }

      const data = await response.json();
      const choice = data?.choices?.[0];
      const content = choice?.message?.content;
      if (content && content.trim().length > 0) {
        return content.trim();
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error('Empty response received from Groq AI.');
}

/**
 * Natural Language Prompt-to-Strategy via Groq AI
 */
export async function groqGenerateStrategy(
  userPrompt: string
): Promise<ParsedStrategyPrompt> {
  try {
    const systemPrompt = `You are an elite quantitative trading engineer for National Stock Exchange (NSE) of India.
Convert user natural language trading prompts into precise strategy parameters in strict JSON format.
Supported strategies: "PSAR_SMA100", "OPENING_RANGE", "STOCHASTIC".
Supported symbols: "INFY", "TCS", "RELIANCE", "HDFCBANK", "TATAMOTORS", "NIFTY 50", "NIFTY BANK", "LT", "ICICIBANK", "ITC", "BHARTIARTL".
Supported timeframes: "1d", "4h", "1h", "15m", "5m".

Return a JSON object with this exact shape:
{
  "symbol": "INFY",
  "timeframe": "1d",
  "strategyType": "PSAR_SMA100",
  "params": {
    "strategyType": "PSAR_SMA100",
    "riskPerTradePct": 1.0,
    "rrRatio": 2.0,
    "psarStart": 0.01,
    "psarStep": 0.01,
    "psarMax": 0.10,
    "smaLength": 100,
    "slLookback": 2,
    "useTrailingStop": false
  },
  "explanation": "Clear 1-sentence plain English summary of configured quantitative parameters."
}`;

    const rawJson = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      true,
      1500
    );

    const parsed = JSON.parse(rawJson);
    return {
      promptText: userPrompt,
      symbol: parsed.symbol || 'INFY',
      timeframe: parsed.timeframe || '1d',
      strategyType: parsed.strategyType || 'PSAR_SMA100',
      params: {
        initialCapital: 100000,
        riskPerTradePct: 1.0,
        rrRatio: 2.0,
        slLookback: 2,
        slippagePoints: 1.0,
        brokeragePerOrder: 20,
        positionMode: 'BOTH',
        ...parsed.params,
      },
      explanation: parsed.explanation || `Configured ${parsed.symbol} ${parsed.strategyType} on ${parsed.timeframe}.`,
    };
  } catch (err) {
    console.warn('Groq AI fallback to deterministic parser:', err);
    return parseNaturalLanguageStrategy(userPrompt);
  }
}

/**
 * Generates AI Hedge-Fund Audit & Prescriptions via Groq AI
 */
export async function groqAuditStrategy(
  trades: Trade[],
  metrics: InstitutionalRiskMetrics,
  monteCarlo: MonteCarloResult,
  symbol: string
): Promise<AIDiagnosticPrescription[]> {
  try {
    const summary = {
      symbol,
      totalTrades: trades.length,
      winRatePct: trades.length ? Number(((trades.filter((t) => t.pnl > 0).length / trades.length) * 100).toFixed(1)) : 0,
      annualizedSharpe: metrics.annualizedSharpeRatio,
      sortinoRatio: metrics.sortinoRatio,
      calmarRatio: metrics.calmarRatio,
      monteCarloMedianDD: monteCarlo.medianDrawdownPct,
      monteCarlo95WorstDD: monteCarlo.percentile95DrawdownPct,
      expectancyPerTrade: metrics.expectancyPerTradeRs,
      maxLossStreak: metrics.maxConsecutiveLosses,
      avgHoldingPeriodBars: metrics.averageHoldingPeriodBars,
    };

    const systemPrompt = `You are a Senior Quantitative Risk Manager at an Indian algorithmic hedge fund.
Review backtest execution metrics and Monte Carlo simulations for an NSE trading strategy.
Identify risk leaks, drawdown distribution risks, and holding period inefficiencies.
Provide 3-4 specific, actionable prescriptions in strict JSON format:
{
  "prescriptions": [
    {
      "category": "RISK" | "TIMING" | "REGIME" | "VOLATILITY",
      "severity": "HIGH" | "MEDIUM" | "INFO",
      "title": "Short title",
      "observation": "Specific quantitative fact observed in the trades.",
      "remedy": "Exact actionable rule change (e.g. adjust RPT %, trail stop, or cooling off)."
    }
  ]
}`;

    const rawJson = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(summary) },
      ],
      true,
      1500
    );

    const parsed = JSON.parse(rawJson);
    if (Array.isArray(parsed.prescriptions) && parsed.prescriptions.length > 0) {
      return parsed.prescriptions;
    }
    throw new Error('Invalid prescriptions format');
  } catch (err) {
    console.warn('Groq Strategy Doctor fallback to rule-based diagnostics:', err);
    return generateAIDiagnostics(trades, metrics, monteCarlo);
  }
}

/**
 * Real-Time Macro Market Regime Commentary via Groq AI
 */
export async function groqMarketRegimeCommentary(
  pulse: MarketPulseData
): Promise<string> {
  try {
    const systemPrompt = `You are an Indian Market Strategist analyzing NSE Nifty 50, India VIX, and Institutional Flows.
Produce a concise, institutional-grade 2-sentence market regime assessment for algorithmic traders.
Mention India VIX level, market breadth, and FII/DII net flows. Keep it sharp and actionable.`;

    const userMsg = `India VIX: ${pulse.indiaVix} (${pulse.indiaVixChangePct > 0 ? '+' : ''}${pulse.indiaVixChangePct}%)
Market Breadth: ${pulse.marketBreadthPct}% of Nifty 50 above 50 EMA (${pulse.niftyAdvanceCount} Adv / ${pulse.niftyDeclineCount} Dec)
FII Net Inflow: ₹${pulse.fiiNetFlowCr} Cr
DII Net Inflow: ₹${pulse.diiNetFlowCr} Cr
Regime: ${pulse.regimeTitle}`;

    const text = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      false,
      300
    );

    return text.trim();
  } catch (err) {
    console.warn('Groq Macro commentary fallback:', err);
    return pulse.regimeDescription;
  }
}

/**
 * Deterministic fallback for company filing & concall analysis
 */
export function generateFallbackFilingAnalysis(
  stock: FundamentalStockData,
  filing: CompanyFilingDetails
): CompanyFilingAnalysis {
  // Score based on Piotroski (max 45), ROCE (max 20), D/E (max 15), PE discount (max 20)
  let score = 50;
  if (stock.piotroskiFScore >= 8) score += 20;
  else if (stock.piotroskiFScore >= 7) score += 10;

  if (stock.rocePct >= 25) score += 15;
  else if (stock.rocePct >= 15) score += 8;

  if (stock.debtToEquity <= 0.1) score += 15;
  else if (stock.debtToEquity <= 0.7) score += 8;
  else score -= 10;

  if (stock.peRatio < stock.industryPe) score += 10;

  score = Math.min(96, Math.max(35, score));

  const clearanceStatus: 'APPROVED' | 'CAUTION' | 'RESTRICTED' =
    score >= 75 ? 'APPROVED' : score >= 55 ? 'CAUTION' : 'RESTRICTED';

  return {
    symbol: stock.symbol,
    companyName: stock.companyName,
    confluenceScore: score,
    clearanceStatus,
    executiveSummary: `${stock.companyName} posted solid ${filing.quarter} numbers with ₹${filing.revenueCr.toLocaleString('en-IN')} Cr revenue and ${filing.ebitdaMarginPct}% EBITDA margins. Piotroski score of ${stock.piotroskiFScore}/9 confirms robust balance sheet hygiene.`,
    managementGuidanceVerdict: filing.concallHighlights.length
      ? `Management highlights: "${filing.concallHighlights[0].statement.slice(0, 160)}..." indicating stable forward operational visibility.`
      : 'Management commentary confirms resilient order inflows across key operating verticals.',
    capexAndDebtOutlook: `${filing.capexGuidance} ${filing.debtCommentary}`,
    technicalSynergyNote:
      clearanceStatus === 'APPROVED'
        ? 'High fundamental congruence. Breakouts and trend-following signals (PSAR/SMA 100) have low risk of unexpected quarterly guidance breakdowns.'
        : 'Moderate fundamental friction. Ensure strict stop losses as margins or debt leverage may cap long-term trend continuation.',
    keyStrengths: [
      `High Piotroski F-Score (${stock.piotroskiFScore}/9) indicating operational profitability`,
      `ROCE at ${stock.rocePct}% versus industry norms`,
      `Healthy EBITDA margin of ${filing.ebitdaMarginPct}% in ${filing.quarter}`,
    ],
    keyVulnerabilities: filing.keyRisks,
  };
}

/**
 * AI Company Filing & Concall Guidance Analyzer via Groq LPU
 */
export async function groqAnalyzeCompanyFiling(
  stock: FundamentalStockData,
  filing: CompanyFilingDetails
): Promise<CompanyFilingAnalysis> {
  try {
    const concallSummary = filing.concallHighlights
      .map((c) => `- ${c.speaker} (${c.role}): [${c.topic}] "${c.statement}"`)
      .join('\n');

    const systemPrompt = `You are an Indian Senior Quantitative Equity Analyst evaluating NSE corporate filings and earnings call transcripts as of November 17, 2026.
Assess the company's quantitative health and executive management guidance based on the latest Q2 FY27 filings (late 2026) and forward guidance into 2027.
Determine if the fundamental setup supports algorithmic swing and momentum trading or poses risk of earnings-driven breakdown.
Respond with strict JSON matching this schema:
{
  "confluenceScore": number (0 to 100),
  "clearanceStatus": "APPROVED" | "CAUTION" | "RESTRICTED",
  "executiveSummary": "2-3 concise sentences synthesizing revenue, margins, and operational trajectory as of late 2026.",
  "managementGuidanceVerdict": "Assessment of CEO/CFO forward guidance and deal/order book visibility.",
  "capexAndDebtOutlook": "Assessment of capital expenditure plans and balance sheet leverage.",
  "technicalSynergyNote": "Specific guidance for algorithmic traders (e.g. PSAR trend followers, breakout traders) on this stock.",
  "keyStrengths": ["string", "string", "string"],
  "keyVulnerabilities": ["string", "string"]
}`;

    const userMsg = `Company: ${stock.companyName} (${stock.symbol})
Sector: ${stock.sector} | Current Price: ₹${stock.currentPrice}
P/E: ${stock.peRatio} (Industry P/E: ${stock.industryPe}) | ROCE: ${stock.rocePct}% | Debt/Equity: ${stock.debtToEquity}
Piotroski F-Score: ${stock.piotroskiFScore}/9 | Days to Next Earnings: ${stock.daysToEarnings}
Latest Filing: ${filing.quarter} (Filed: ${filing.filingDate})
Revenue: ₹${filing.revenueCr.toLocaleString('en-IN')} Cr (YoY: ${stock.qtrRevenueGrowthPct}%)
EBITDA Margin: ${filing.ebitdaMarginPct}% | PAT: ₹${filing.patCr.toLocaleString('en-IN')} Cr
Capex Guidance: ${filing.capexGuidance}
Debt Commentary: ${filing.debtCommentary}
Concall Transcript Highlights:
${concallSummary}
Known Filing Risks:
${filing.keyRisks.map((r) => `- ${r}`).join('\n')}`;

    const rawJson = await callGroqChat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMsg },
      ],
      true,
      1500
    );

    const parsed = JSON.parse(rawJson);
    return {
      symbol: stock.symbol,
      companyName: stock.companyName,
      confluenceScore: typeof parsed.confluenceScore === 'number' ? parsed.confluenceScore : 82,
      clearanceStatus: ['APPROVED', 'CAUTION', 'RESTRICTED'].includes(parsed.clearanceStatus)
        ? parsed.clearanceStatus
        : 'APPROVED',
      executiveSummary: parsed.executiveSummary || `${stock.companyName} demonstrates solid execution across core verticals.`,
      managementGuidanceVerdict: parsed.managementGuidanceVerdict || 'Management outlook supports stable compounding.',
      capexAndDebtOutlook: parsed.capexAndDebtOutlook || filing.capexGuidance,
      technicalSynergyNote: parsed.technicalSynergyNote || 'Filing fundamentals are aligned with technical trend continuation.',
      keyStrengths: Array.isArray(parsed.keyStrengths) && parsed.keyStrengths.length ? parsed.keyStrengths : [
        `Robust Piotroski score of ${stock.piotroskiFScore}/9`,
        `Healthy EBITDA margin of ${filing.ebitdaMarginPct}%`,
      ],
      keyVulnerabilities: Array.isArray(parsed.keyVulnerabilities) && parsed.keyVulnerabilities.length ? parsed.keyVulnerabilities : filing.keyRisks,
    };
  } catch (err) {
    console.warn('Groq filing analysis fallback:', err);
    return generateFallbackFilingAnalysis(stock, filing);
  }
}
