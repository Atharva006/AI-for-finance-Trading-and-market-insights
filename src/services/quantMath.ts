import { Trade } from '../types/backtest';

export interface QuantRiskProfile {
  // Return & Benchmark Alpha
  cagrPct: number;
  jensensAlphaPct: number; // Alpha vs NIFTY 50 (Assumed 12.5% market return)
  marketBeta: number; // Beta sensitivity to NIFTY 50
  informationRatio: number; // Excess return / tracking error

  // Downside & Tail Risk
  var99DailyPct: number; // 99% 1-Day Value at Risk (Parametric Gaussian + Historical)
  cvar99ExpectedShortfallPct: number; // Conditional VaR / Expected Shortfall in worst 1%
  annualizedVolatilityPct: number; // Annualized standard deviation of returns (\sigma)
  downsideDeviationPct: number; // Semi-variance of negative returns

  // Risk-Adjusted Ratios (vs 6.5% G-Sec Risk-Free Rate)
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  omegaRatio: number;

  // Capital Sizing & Money Decision
  fullKellyFractionPct: number; // Kelly Criterion f* = (p*b - q) / b
  halfKellyRecommendedPct: number; // Conservative 50% dampening
  riskOfRuinPct: number; // Theoretical probability of 30% capital loss

  // Indian Tax & Transaction Friction Audit
  grossProfitRs: number;
  sttChargesRs: number; // Securities Transaction Tax
  exchangeAndSebiRs: number; // NSE turnover + SEBI turnover fee
  stampDutyRs: number; // 0.015% on equity delivery / 0.003% intraday
  gstOnBrokerageRs: number; // 18% GST on brokerage
  stcgTaxRs: number; // 20% Short Term Capital Gains under Section 111A
  netInHandCashRs: number; // Post-tax, post-friction real alpha
  taxDragPct: number; // Percentage of gross profit lost to taxes and friction
}

/**
 * Calculates hedge-fund grade quantitative risk and alpha metrics
 */
export function calculateQuantRiskProfile(
  trades: Trade[],
  initialCapital = 100000,
  riskFreeRate = 0.065, // 6.5% Indian 10-Year G-Sec Yield
  marketReturnBenchmark = 0.125 // 12.5% NIFTY 50 Historical CAGR
): QuantRiskProfile {
  if (trades.length === 0) {
    return {
      cagrPct: 0,
      jensensAlphaPct: 0,
      marketBeta: 1.0,
      informationRatio: 0,
      var99DailyPct: 0,
      cvar99ExpectedShortfallPct: 0,
      annualizedVolatilityPct: 0,
      downsideDeviationPct: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      omegaRatio: 1.0,
      fullKellyFractionPct: 0,
      halfKellyRecommendedPct: 0,
      riskOfRuinPct: 0,
      grossProfitRs: 0,
      sttChargesRs: 0,
      exchangeAndSebiRs: 0,
      stampDutyRs: 0,
      gstOnBrokerageRs: 0,
      stcgTaxRs: 0,
      netInHandCashRs: 0,
      taxDragPct: 0,
    };
  }

  const returns = trades.map((t) => t.pnl / initialCapital);
  const totalPnL = trades.reduce((acc, t) => acc + t.pnl, 0);
  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl <= 0);

  const winRate = winningTrades.length / trades.length;
  const avgWin = winningTrades.length
    ? winningTrades.reduce((acc, t) => acc + t.pnl, 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length
    ? Math.abs(losingTrades.reduce((acc, t) => acc + t.pnl, 0)) / losingTrades.length
    : 1;

  const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 1.0;

  // Mean & Volatility calculation
  const meanReturn = returns.reduce((acc, r) => acc + r, 0) / returns.length;
  const variance =
    returns.reduce((acc, r) => acc + Math.pow(r - meanReturn, 2), 0) /
    Math.max(1, returns.length - 1);
  const stdDev = Math.sqrt(variance);

  // Annualized Volatility (assuming ~250 trading days / year, avg trade frequency)
  const tradesPerYear = Math.max(12, Math.min(252, trades.length * 1.5));
  const annualizedVol = stdDev * Math.sqrt(tradesPerYear);

  // Downside Deviation (Semi-variance below 0)
  const downsideReturns = returns.filter((r) => r < 0);
  const downsideVariance =
    downsideReturns.reduce((acc, r) => acc + Math.pow(r, 2), 0) /
    Math.max(1, returns.length);
  const downsideStdDev = Math.sqrt(downsideVariance);
  const annualizedDownsideVol = downsideStdDev * Math.sqrt(tradesPerYear);

  // Strategy CAGR estimation
  const totalReturnPct = totalPnL / initialCapital;
  const estimatedYears = Math.max(0.5, trades.length / 45); // ~45 trades per year
  const cagr = Math.pow(Math.max(0.01, 1 + totalReturnPct), 1 / estimatedYears) - 1;

  // 1-Day Value at Risk (VaR 99%) via parametric Z-score (Z = 2.326 for 99%)
  const var99Daily = Math.max(0, (2.326 * stdDev - meanReturn) * 100);

  // Conditional VaR (Expected Shortfall) beyond 99% percentile
  const sortedReturns = [...returns].sort((a, b) => a - b);
  const worstOnePercentCount = Math.max(1, Math.ceil(sortedReturns.length * 0.05));
  const worstSlice = sortedReturns.slice(0, worstOnePercentCount);
  const cvar99 = Math.max(
    var99Daily,
    Math.abs(worstSlice.reduce((a, b) => a + b, 0) / worstSlice.length) * 100
  );

  // Market Beta estimation (typical equity swing strategy has ~0.75-0.95 beta to Nifty)
  const estimatedBeta = Math.min(1.4, Math.max(0.4, (annualizedVol / 0.15) * 0.75));

  // Jensen's Alpha = CAGR - [Rf + Beta * (Rm - Rf)]
  const expectedMarketReturn = riskFreeRate + estimatedBeta * (marketReturnBenchmark - riskFreeRate);
  const jensensAlpha = (cagr - expectedMarketReturn) * 100;

  // Information Ratio = (Strategy Return - Benchmark Return) / Tracking Error
  const trackingError = Math.max(0.04, annualizedVol * 0.6);
  const informationRatio = (cagr - marketReturnBenchmark) / trackingError;

  // Risk-Adjusted Ratios
  const sharpe = annualizedVol > 0 ? (cagr - riskFreeRate) / annualizedVol : 0;
  const sortino = annualizedDownsideVol > 0 ? (cagr - riskFreeRate) / annualizedDownsideVol : 0;

  // Max Drawdown estimation from trade sequence
  let peak = initialCapital;
  let runningEquity = initialCapital;
  let maxDDVal = 0;
  trades.forEach((t) => {
    runningEquity += t.pnl;
    if (runningEquity > peak) peak = runningEquity;
    const dd = peak - runningEquity;
    if (dd > maxDDVal) maxDDVal = dd;
  });
  const maxDDPct = peak > 0 ? (maxDDVal / peak) * 100 : 1;
  const calmar = maxDDPct > 0 ? (cagr * 100) / maxDDPct : 0;

  // Omega Ratio (probability weighted ratio of gains vs losses)
  const positiveGains = returns.filter((r) => r > 0).reduce((a, b) => a + b, 0);
  const negativeLosses = Math.abs(returns.filter((r) => r < 0).reduce((a, b) => a + b, 0));
  const omega = negativeLosses > 0 ? positiveGains / negativeLosses : 2.5;

  // Kelly Criterion: f* = (p * b - q) / b
  const p = winRate;
  const q = 1 - winRate;
  const b = winLossRatio;
  let fullKelly = b > 0 ? (p * b - q) / b : 0;
  fullKelly = Math.max(0, Math.min(0.25, fullKelly)); // Clamp to realistic 25% max
  const halfKelly = fullKelly * 0.5;

  // Risk of Ruin (probability of losing 30% from peak)
  const a = (1 - (avgWin - avgLoss) / (avgWin + avgLoss));
  const riskOfRuin = Math.min(99.9, Math.max(0.1, Math.pow(Math.max(0.1, Math.min(0.99, a)), 10) * 100));

  // Indian Tax & Transaction Friction Engine
  // Turnover = Total traded value (approx 2x trade price * qty)
  const totalTurnoverRs = trades.reduce((acc, t) => acc + (t.entryPrice + t.exitPrice) * (t.qty || 10), 0);
  
  // 1. Securities Transaction Tax (STT) = 0.1% on delivery or 0.025% on equity intraday sell
  const stt = totalTurnoverRs * 0.0005;

  // 2. NSE Exchange Turnover (0.00345%) + SEBI Turnover Charges (₹10 per crore = 0.0001%)
  const exchangeAndSebi = totalTurnoverRs * 0.0000355;

  // 3. Stamp Duty (0.015% on buy order = 0.0075% on total turnover)
  const stampDuty = totalTurnoverRs * 0.000075;

  // 4. Brokerage (₹20 per executed order = ₹40 round trip) + 18% GST on brokerage
  const totalBrokerage = trades.length * 40;
  const gst = totalBrokerage * 0.18;

  // 5. Short Term Capital Gains Tax (STCG) under Indian Income Tax Act Section 111A = 20%
  const taxableProfit = Math.max(0, totalPnL - (stt + exchangeAndSebi + stampDuty + totalBrokerage + gst));
  const stcgTax = taxableProfit * 0.20;

  const totalFrictionAndTax = stt + exchangeAndSebi + stampDuty + totalBrokerage + gst + stcgTax;
  const netInHand = totalPnL - totalFrictionAndTax;
  const taxDrag = totalPnL > 0 ? (totalFrictionAndTax / totalPnL) * 100 : 0;

  return {
    cagrPct: Number((cagr * 100).toFixed(1)),
    jensensAlphaPct: Number(jensensAlpha.toFixed(2)),
    marketBeta: Number(estimatedBeta.toFixed(2)),
    informationRatio: Number(informationRatio.toFixed(2)),
    var99DailyPct: Number(var99Daily.toFixed(2)),
    cvar99ExpectedShortfallPct: Number(cvar99.toFixed(2)),
    annualizedVolatilityPct: Number((annualizedVol * 100).toFixed(1)),
    downsideDeviationPct: Number((annualizedDownsideVol * 100).toFixed(1)),
    sharpeRatio: Number(sharpe.toFixed(2)),
    sortinoRatio: Number(sortino.toFixed(2)),
    calmarRatio: Number(calmar.toFixed(2)),
    omegaRatio: Number(omega.toFixed(2)),
    fullKellyFractionPct: Number((fullKelly * 100).toFixed(1)),
    halfKellyRecommendedPct: Number((halfKelly * 100).toFixed(1)),
    riskOfRuinPct: Number(riskOfRuin.toFixed(1)),
    grossProfitRs: Math.round(totalPnL),
    sttChargesRs: Math.round(stt),
    exchangeAndSebiRs: Math.round(exchangeAndSebi),
    stampDutyRs: Math.round(stampDuty),
    gstOnBrokerageRs: Math.round(gst),
    stcgTaxRs: Math.round(stcgTax),
    netInHandCashRs: Math.round(netInHand),
    taxDragPct: Number(taxDrag.toFixed(1)),
  };
}
