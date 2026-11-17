import { StrategyBasket, BasketBacktestResult, BasketTrade, BasketItemBreakdown } from '../types/basket';
import { Candle, StrategyParams, EquityPoint } from '../types/backtest';
import { fetchHistoricalDailyCandles } from './historicalData';
import { fetchUpstoxCandles } from './upstoxApi';
import { runBacktest } from './backtestEngine';

export async function runBasketBacktest(
  basket: StrategyBasket,
  onProgress?: (msg: string, completed: number, total: number) => void
): Promise<BasketBacktestResult> {
  const activeItems = basket.items.filter((item) => item.enabled);
  const initialCap = basket.initialCapital || 100000;

  if (activeItems.length === 0) {
    return {
      basketName: basket.name,
      initialCapital: initialCap,
      finalCapital: initialCap,
      totalReturn: 0,
      totalReturnPct: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      profitFactor: 1.0,
      maxDrawdownPct: 0,
      maxDrawdownVal: 0,
      equityCurve: [{ time: 'Start', equity: initialCap, benchmarkEquity: initialCap, drawdownPct: 0 }],
      trades: [],
      breakdown: [],
    };
  }

  const allTrades: BasketTrade[] = [];
  const breakdowns: BasketItemBreakdown[] = [];

  for (let i = 0; i < activeItems.length; i++) {
    const item = activeItems[i];
    onProgress?.(`Processing ${item.stock.symbol} (${item.strategyType})...`, i + 1, activeItems.length);

    try {
      let candles: Candle[] = [];
      if (item.timeframe === '1d') {
        candles = await fetchHistoricalDailyCandles({
          stock: item.stock,
          provider: 'yahoo',
          range: 'max',
        });
      } else {
        candles = await fetchUpstoxCandles({
          instrumentKey: item.stock.instrument_key,
          timeframe: item.timeframe,
        });
      }

      if (candles.length === 0) {
        continue;
      }

      const itemParams: StrategyParams = {
        strategyType: item.strategyType,
        initialCapital: initialCap,
        riskPerTradePct: item.riskPerTradePct,
        // PSAR defaults
        tradeDir: 'Both',
        psarStart: 0.01,
        psarStep: 0.01,
        psarMax: 0.10,
        smaLength: 100,
        slLookback: 2,
        rrRatio: 2.0,
        maxRiskPercent: 9.0,
        // ORB defaults
        orbTimeframeMinutes: 5,
        orbSlBodyPct: 0.70,
        orbRiskReward: 1.5,
        orbRiskPerTradeINR: (initialCap * item.riskPerTradePct) / 100,
        // Stochastic defaults
        stochKPeriod: 14,
        stochSmooth: 3,
        stochDPeriod: 3,
        stochOverbought: 80,
        stochOversold: 20,
        fixedSlPct: 1.2,
        fixedTpPct: 3.6,
        atrPeriod: 14,
        atrSlMultiplier: 1.2,
        atrTpMultiplier: 3.6,
        useTrailingStop: false,
        slippagePoints: 1.0,
        brokeragePerOrder: 20,
        positionMode: 'BOTH',
        ...item.customParams,
      };

      const result = runBacktest(candles, itemParams);
      const riskAmount = (initialCap * item.riskPerTradePct) / 100;

      const itemTrades: BasketTrade[] = result.trades.map((t) => ({
        ...t,
        id: `${item.stock.symbol}-${t.id}`,
        symbol: item.stock.symbol,
        stockName: item.stock.name,
        strategyType: item.strategyType,
        rptPct: item.riskPerTradePct,
        riskAmount,
      }));

      allTrades.push(...itemTrades);

      const itemWins = itemTrades.filter((t) => t.pnl > 0).length;
      const itemLosses = itemTrades.filter((t) => t.pnl <= 0).length;
      const itemNetPnl = Number(itemTrades.reduce((acc, t) => acc + t.pnl, 0).toFixed(2));
      const itemGains = itemTrades.filter((t) => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
      const itemLossTot = Math.abs(itemTrades.filter((t) => t.pnl <= 0).reduce((acc, t) => acc + t.pnl, 0));
      const itemPf = itemLossTot > 0 ? Number((itemGains / itemLossTot).toFixed(2)) : itemGains > 0 ? 99.9 : 1.0;

      breakdowns.push({
        id: item.id,
        symbol: item.stock.symbol,
        stockName: item.stock.name,
        strategyType: item.strategyType,
        timeframe: item.timeframe,
        rptPct: item.riskPerTradePct,
        totalTrades: itemTrades.length,
        winningTrades: itemWins,
        losingTrades: itemLosses,
        winRate: itemTrades.length > 0 ? Number(((itemWins / itemTrades.length) * 100).toFixed(1)) : 0,
        netPnl: itemNetPnl,
        returnPct: Number(((itemNetPnl / initialCap) * 100).toFixed(2)),
        profitFactor: itemPf,
      });
    } catch (err) {
      console.error(`Failed to backtest item ${item.stock.symbol}:`, err);
    }
  }

  // Sort trades chronologically by exitTime or entryTime
  allTrades.sort((a, b) => {
    const timeA = new Date(a.exitTime || a.entryTime).getTime() || 0;
    const timeB = new Date(b.exitTime || b.entryTime).getTime() || 0;
    return timeA - timeB;
  });

  // Build Unified Portfolio Equity Curve
  let currentCap = initialCap;
  let peakCap = initialCap;
  const equityCurve: EquityPoint[] = [
    {
      time: allTrades.length > 0 ? allTrades[0].entryTime : 'Start',
      equity: initialCap,
      benchmarkEquity: initialCap,
      drawdownPct: 0,
    },
  ];

  for (const tr of allTrades) {
    currentCap += tr.pnl;
    if (currentCap > peakCap) {
      peakCap = currentCap;
    }
    const dd = peakCap > 0 ? ((peakCap - currentCap) / peakCap) * 100 : 0;
    equityCurve.push({
      time: tr.exitTime || tr.entryTime,
      equity: Number(currentCap.toFixed(2)),
      benchmarkEquity: initialCap,
      drawdownPct: Number(dd.toFixed(2)),
    });
  }

  const totalReturn = Number((currentCap - initialCap).toFixed(2));
  const totalReturnPct = Number(((totalReturn / initialCap) * 100).toFixed(2));
  const totalTrades = allTrades.length;
  const winningTrades = allTrades.filter((t) => t.pnl > 0).length;
  const losingTrades = allTrades.filter((t) => t.pnl <= 0).length;
  const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

  const totalGains = allTrades.filter((t) => t.pnl > 0).reduce((acc, t) => acc + t.pnl, 0);
  const totalLosses = Math.abs(allTrades.filter((t) => t.pnl <= 0).reduce((acc, t) => acc + t.pnl, 0));
  const profitFactor = totalLosses > 0 ? Number((totalGains / totalLosses).toFixed(2)) : totalGains > 0 ? 99.9 : 1.0;

  let maxDd = 0;
  for (const pt of equityCurve) {
    if (pt.drawdownPct > maxDd) {
      maxDd = pt.drawdownPct;
    }
  }
  const maxDrawdownPct = Number(maxDd.toFixed(2));
  const maxDrawdownVal = Number(((initialCap * maxDrawdownPct) / 100).toFixed(2));

  return {
    basketName: basket.name,
    initialCapital: initialCap,
    finalCapital: Number(currentCap.toFixed(2)),
    totalReturn,
    totalReturnPct,
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    profitFactor,
    maxDrawdownPct,
    maxDrawdownVal,
    equityCurve,
    trades: allTrades,
    breakdown: breakdowns,
  };
}
