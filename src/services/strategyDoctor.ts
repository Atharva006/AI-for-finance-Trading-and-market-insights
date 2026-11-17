import { Trade } from '../types/backtest';
import {
  MonteCarloResult,
  InstitutionalRiskMetrics,
  AIDiagnosticPrescription,
} from '../types/marketPulse';

/**
 * Executes a 500-iteration Monte Carlo Bootstrap Simulation on executed trades
 * by randomly resampling trade sequences with replacement.
 */
export function calculateMonteCarloSimulation(
  trades: Trade[],
  initialCapital: number = 100000,
  iterations: number = 500
): MonteCarloResult {
  if (trades.length === 0) {
    return {
      iterations: 0,
      medianDrawdownPct: 0,
      percentile90DrawdownPct: 0,
      percentile95DrawdownPct: 0,
      riskOfSevereDDPct: 0,
      simulatedPaths: [],
    };
  }

  const pnlList = trades.map((t) => t.pnl);
  const nTrades = pnlList.length;
  const maxDrawdowns: number[] = [];
  const samplePaths: { pathIndex: number; curve: number[] }[] = [];

  for (let iter = 0; iter < iterations; iter++) {
    let currentEquity = initialCapital;
    let peakEquity = initialCapital;
    let maxDdPct = 0;
    const curve: number[] = [initialCapital];

    for (let step = 0; step < nTrades; step++) {
      const randomIndex = Math.floor(Math.random() * nTrades);
      const tradePnl = pnlList[randomIndex];
      currentEquity += tradePnl;
      curve.push(Number(currentEquity.toFixed(2)));

      if (currentEquity > peakEquity) {
        peakEquity = currentEquity;
      }

      const ddPct = ((peakEquity - currentEquity) / peakEquity) * 100;
      if (ddPct > maxDdPct) {
        maxDdPct = ddPct;
      }
    }

    maxDrawdowns.push(Number(maxDdPct.toFixed(2)));

    // Store up to 10 sample paths for rendering
    if (iter < 10) {
      samplePaths.push({ pathIndex: iter, curve });
    }
  }

  // Sort drawdowns ascending
  maxDrawdowns.sort((a, b) => a - b);

  const medianIndex = Math.floor(iterations * 0.5);
  const p90Index = Math.floor(iterations * 0.9);
  const p95Index = Math.floor(iterations * 0.95);

  const severeDDCount = maxDrawdowns.filter((dd) => dd > 12.0).length;
  const riskOfSevereDDPct = Number(((severeDDCount / iterations) * 100).toFixed(1));

  return {
    iterations,
    medianDrawdownPct: maxDrawdowns[medianIndex] || 0,
    percentile90DrawdownPct: maxDrawdowns[p90Index] || 0,
    percentile95DrawdownPct: maxDrawdowns[p95Index] || 0,
    riskOfSevereDDPct,
    simulatedPaths: samplePaths,
  };
}

/**
 * Calculates Institutional Risk-Adjusted Metrics (Sharpe, Sortino, Calmar, Expectancy)
 * relative to the Indian 10-Year G-Sec benchmark risk-free rate of 6.5%.
 */
export function calculateInstitutionalRiskMetrics(
  trades: Trade[],
  initialCapital: number = 100000,
  riskFreeRate: number = 0.065
): InstitutionalRiskMetrics {
  if (trades.length === 0) {
    return {
      annualizedSharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      profitFactor: 0,
      expectancyPerTradeRs: 0,
      averageHoldingPeriodBars: 0,
      maxConsecutiveLosses: 0,
    };
  }

  const returns = trades.map((t) => t.pnl / initialCapital);
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Standard Deviation
  const variance =
    returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length || 1);
  const stdDev = Math.sqrt(variance) || 0.0001;

  // Downside Deviation (for Sortino Ratio)
  const downsideVariance =
    returns
      .filter((r) => r < 0)
      .reduce((sum, r) => sum + Math.pow(r, 2), 0) / (returns.length || 1);
  const downsideStdDev = Math.sqrt(downsideVariance) || 0.0001;

  // Annualized assumption (~250 trading bars/year)
  const tradesPerYear = Math.max(12, Math.min(252, trades.length));
  const annualizedReturn = meanReturn * tradesPerYear;
  const annualizedStdDev = stdDev * Math.sqrt(tradesPerYear);
  const annualizedDownsideStdDev = downsideStdDev * Math.sqrt(tradesPerYear);

  const annualizedSharpeRatio = Number(
    ((annualizedReturn - riskFreeRate) / annualizedStdDev).toFixed(2)
  );

  const sortinoRatio = Number(
    ((annualizedReturn - riskFreeRate) / annualizedDownsideStdDev).toFixed(2)
  );

  // Profit Factor & Expectancy
  const grossProfit = trades.filter((t) => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(trades.filter((t) => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss === 0 ? 99.9 : Number((grossProfit / grossLoss).toFixed(2));

  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
  const expectancyPerTradeRs = Number((totalPnL / trades.length).toFixed(2));

  // Max Drawdown & Calmar
  let peak = initialCapital;
  let running = initialCapital;
  let maxDD = 0;
  for (const t of trades) {
    running += t.pnl;
    if (running > peak) peak = running;
    const dd = (peak - running) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  const calmarRatio = maxDD === 0 ? 99.9 : Number(((totalPnL / initialCapital) / maxDD).toFixed(2));

  // Consecutive Losses
  let currentLossStreak = 0;
  let maxLossStreak = 0;
  for (const t of trades) {
    if (t.pnl < 0) {
      currentLossStreak++;
      if (currentLossStreak > maxLossStreak) maxLossStreak = currentLossStreak;
    } else {
      currentLossStreak = 0;
    }
  }

  // Average Holding Duration
  const averageHoldingPeriodBars = Number(
    (
      trades.reduce((sum, t) => sum + Math.max(1, t.exitIndex - t.entryIndex || 4), 0) /
      (trades.length || 1)
    ).toFixed(1)
  );

  return {
    annualizedSharpeRatio: isNaN(annualizedSharpeRatio) ? 0 : annualizedSharpeRatio,
    sortinoRatio: isNaN(sortinoRatio) ? 0 : sortinoRatio,
    calmarRatio: isNaN(calmarRatio) ? 0 : calmarRatio,
    profitFactor,
    expectancyPerTradeRs,
    averageHoldingPeriodBars,
    maxConsecutiveLosses: maxLossStreak,
  };
}

/**
 * Evaluates trade logs and generates actionable AI hedge-fund prescriptions.
 */
export function generateAIDiagnostics(
  trades: Trade[],
  metrics: InstitutionalRiskMetrics,
  monteCarlo: MonteCarloResult
): AIDiagnosticPrescription[] {
  const prescriptions: AIDiagnosticPrescription[] = [];

  // 1. Monte Carlo Tail Risk
  if (monteCarlo.percentile95DrawdownPct > 12.0) {
    prescriptions.push({
      category: 'RISK',
      severity: 'HIGH',
      title: 'Monte Carlo 95% Worst-Case Drawdown Alert',
      observation: `Randomized trade reshuffling indicates a 95% confidence max drawdown of ${monteCarlo.percentile95DrawdownPct}%, significantly higher than the backtested curve.`,
      remedy: 'Reduce Risk Per Trade from 1.0% to 0.75% or tighten lookback Stop Loss from 2 bars to 1 bar.',
    });
  } else {
    prescriptions.push({
      category: 'RISK',
      severity: 'INFO',
      title: 'Resilient Drawdown Profile',
      observation: `Monte Carlo median drawdown is well controlled at ${monteCarlo.medianDrawdownPct}%.`,
      remedy: 'Capital allocation is mathematically sound. Maintain 1% RPT position sizing.',
    });
  }

  // 2. Risk-to-Reward & Sortino
  if (metrics.sortinoRatio > 1.5) {
    prescriptions.push({
      category: 'VOLATILITY',
      severity: 'INFO',
      title: 'Strong Asymmetric Downside Protection',
      observation: `Sortino Ratio of ${metrics.sortinoRatio} indicates high reward efficiency per unit of bad (downside) volatility.`,
      remedy: 'Keep 1:2.0 RR brackets intact; exiting early reduces expectancy.',
    });
  } else {
    prescriptions.push({
      category: 'VOLATILITY',
      severity: 'MEDIUM',
      title: 'Downside Volatility Leak',
      observation: `Sortino Ratio is ${metrics.sortinoRatio}. Downside deviations are cutting into cumulative gains.`,
      remedy: 'Incorporate ATR trailing stop or 100 SMA trend filter to eliminate counter-trend entries.',
    });
  }

  // 3. Loss Streak Protection
  if (metrics.maxConsecutiveLosses >= 4) {
    prescriptions.push({
      category: 'TIMING',
      severity: 'MEDIUM',
      title: 'Loss Streak Risk Guard Triggered',
      observation: `Detected a peak cluster of ${metrics.maxConsecutiveLosses} consecutive losing trades.`,
      remedy: 'Activate a 24-hour cooling-off rule after 3 consecutive stop outs to avoid whipsaw regimes.',
    });
  }

  // 4. Holding Period Efficiency
  if (metrics.averageHoldingPeriodBars > 10) {
    prescriptions.push({
      category: 'TIMING',
      severity: 'MEDIUM',
      title: 'Extended Holding Period Profit Decay',
      observation: `Trades are held for an average of ${metrics.averageHoldingPeriodBars} bars. Longer holds degrade profit factor in swing regimes.`,
      remedy: 'Introduce a time-stop exiting trades if neither target nor stop is reached within 8 bars.',
    });
  }

  return prescriptions;
}
