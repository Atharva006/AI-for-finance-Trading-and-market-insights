import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Bookmark,
  Play,
  RotateCcw,
  Download,
  Shield,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sliders,
  CheckCircle2,
  Calendar,
  ToggleLeft,
  ToggleRight,
  SlidersHorizontal,
  X,
  Plus,
  Eye,
  Crosshair,
  TrendingUp,
  Globe,
  Database,
  Compass,
  Code,
  Copy,
  Check,
  Terminal,
  Star,
  ArrowLeft,
  Zap,
} from 'lucide-react';
import { AlgoStrategy } from '../types/algoMarketplace';
import { getStoredStrategies } from '../services/strategyStore';
import { Candle, StrategyParams, BacktestResult } from '../types/backtest';
import { StockLogo } from './StockLogo';
import { StrategyQuantAudit } from './StrategyQuantAudit';
import { isAlgoInWatchlist, toggleWatchlist, deployAlgoPosition } from '../services/watchlistStore';
import { fetchUpstoxCandles } from '../services/upstoxApi';
import { runBacktest } from '../services/backtestEngine';
import { POPULAR_NSE_STOCKS, ALL_NSE_INDICES, fetchAllNseStocks, NseStock } from '../services/nseStocks';
import { fetchHistoricalDailyCandles, HistoricalDataProvider, HistoricalRange } from '../services/historicalData';

const PINE_SCRIPT_SOURCE = `// © Atharva Bhosale
//@version=5
strategy("PSAR + SMA100 Swing (Direction Toggle)", 
     overlay=true, 
     initial_capital=100000, 
     calc_on_every_tick=false)

// ---------- INPUTS ----------
trade_dir        = input.string("Both", "Trade Direction", options=["Both", "Buy Only", "Sell Only"])
psar_start       = input.float(0.01, "PSAR Start (AF)", step=0.01, group="Indicators")
psar_step        = input.float(0.01, "PSAR Step (AF increment)", step=0.01, group="Indicators")
psar_max         = input.float(0.10, "PSAR Maximum (AF)", step=0.01, group="Indicators")
sma_len          = input.int(100, "SMA Length", minval=1, group="Indicators")

lookback         = input.int(2, "Stop-Loss: N candles back", group="Risk Management")
rr_ratio         = input.float(2.0, "Risk : Reward Ratio", step=0.1, group="Risk Management")
max_risk_percent = input.float(9.0, "Max Risk % per Trade", step=0.5, group="Risk Management")
risk_per_trade   = input.float(1.0, "Risk Per Trade (%)", step=0.1, group="Risk Management")

// ---------- DIRECTION BOOLS ----------
allow_long  = (trade_dir == "Both" or trade_dir == "Buy Only")
allow_short = (trade_dir == "Both" or trade_dir == "Sell Only")

// ---------- INDICATORS ----------
psar   = ta.sar(psar_start, psar_step, psar_max)
sma100 = ta.sma(close, sma_len)

// Trend States
sma_rising  = sma100 > sma100[1]
sma_falling = sma100 < sma100[1]

// ---------- SIGNAL DETECTION ----------
psar_prev_above_buy = psar[1] > high[1]
psar_now_below_buy  = psar < low
psar_flip_buy       = psar_prev_above_buy and psar_now_below_buy and sma_rising 

psar_prev_below_sell = psar[1] < low[1]
psar_now_above_sell  = psar > high
psar_flip_sell       = psar_prev_below_sell and psar_now_above_sell and sma_falling

// ---------- ORDER MANAGEMENT ----------
var int buy_signal_bar  = na
var int sell_signal_bar = na

if strategy.position_size == 0
    if psar_flip_buy and allow_long
        strategy.cancel("Buy")
        float buy_breakout = high
        float buy_sl       = low[lookback]
        float buy_risk     = buy_breakout - buy_sl
        float buy_target   = buy_breakout + (buy_risk * rr_ratio)
        float risk_amount  = strategy.equity * (risk_per_trade / 100)
        float buy_qty      = buy_risk > 0 ? math.floor(risk_amount / buy_risk) : 0
        float buy_risk_pct = (buy_risk / buy_breakout) * 100
        if buy_risk_pct <= max_risk_percent and buy_qty > 0
            strategy.entry("Buy", strategy.long, qty=buy_qty, stop=buy_breakout, comment="Long Setup")
            strategy.exit("Exit Buy", from_entry="Buy", stop=buy_sl, limit=buy_target)
            buy_signal_bar := bar_index

    if psar_flip_sell and allow_short
        strategy.cancel("Sell")
        float sell_breakout = low
        float sell_sl       = high[lookback]
        float sell_risk     = sell_sl - sell_breakout
        float sell_target   = sell_breakout - (sell_risk * rr_ratio)
        float risk_amount   = strategy.equity * (risk_per_trade / 100)
        float sell_qty      = sell_risk > 0 ? math.floor(risk_amount / sell_risk) : 0
        float sell_risk_pct = (sell_risk / sell_breakout) * 100
        if sell_risk_pct <= max_risk_percent and sell_qty > 0
            strategy.entry("Sell", strategy.short, qty=sell_qty, stop=sell_breakout, comment="Short Setup")
            strategy.exit("Exit Sell", from_entry="Sell", stop=sell_sl, limit=sell_target)
            sell_signal_bar := bar_index

if not na(buy_signal_bar) and bar_index == buy_signal_bar + 2 and strategy.position_size == 0
    strategy.cancel("Buy")
    buy_signal_bar := na 

if not na(sell_signal_bar) and bar_index == sell_signal_bar + 2 and strategy.position_size == 0
    strategy.cancel("Sell")
    sell_signal_bar := na`;

interface DhanStrategyDetailProps {
  strategy: AlgoStrategy;
  allStrategies?: AlgoStrategy[];
  onSelectStrategy: (s: AlgoStrategy) => void;
  onOpenSettings: () => void;
  onBack?: () => void;
}

export const DhanStrategyDetail: React.FC<DhanStrategyDetailProps> = ({
  strategy,
  allStrategies,
  onSelectStrategy,
  onOpenSettings,
  onBack,
}) => {
  const availableStrategies = allStrategies || getStoredStrategies();
  const [activeTab, setActiveTab] = useState<'performance' | 'backtest' | 'trades' | 'about'>('performance');

  // Watchlist & Toast State
  const [isBookmarked, setIsBookmarked] = useState<boolean>(() => isAlgoInWatchlist(strategy.id));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsBookmarked(isAlgoInWatchlist(strategy.id));
  }, [strategy.id]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleToggleTrackList = () => {
    const { isSaved } = toggleWatchlist(strategy.id);
    setIsBookmarked(isSaved);
    setToastMessage(isSaved ? 'Algo added to track list' : 'Algo removed from track list');
  };

  const handleDeploy = () => {
    deployAlgoPosition(strategy.id, strategy.name, strategy.marginRequired, selectedStock.symbol);
    setToastMessage('Strategy deployed to virtual paper execution portfolio');
  };

  const isOrbStrategy =
    strategy.category === 'Opening Range Breakout' ||
    strategy.defaultParams?.strategyType === 'OPENING_RANGE';

  const isPsarStrategy =
    strategy.id === 'algo-psar-sma100-swing' ||
    strategy.defaultParams?.strategyType === 'PSAR_SMA100' ||
    strategy.name.toLowerCase().includes('psar');

  // Third-Party Data Provider & History Range State
  const [dataProvider, setDataProvider] = useState<HistoricalDataProvider>(
    (strategy.defaultParams?.dataProvider as HistoricalDataProvider) || (isPsarStrategy ? 'yahoo' : 'upstox')
  );
  const [historyRange, setHistoryRange] = useState<HistoricalRange>(
    (strategy.defaultParams?.historyRange as HistoricalRange) || 'max'
  );
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [stockCategoryTab, setStockCategoryTab] = useState<'ALL' | 'INDICES' | 'EQUITIES'>('INDICES');

  // Stock / Pair Selection State
  const [selectedStock, setSelectedStock] = useState<NseStock>(() => {
    if (strategy.targetSymbol) {
      const match = POPULAR_NSE_STOCKS.find((s) => s.symbol === strategy.targetSymbol);
      if (match) return match;
      return {
        symbol: strategy.targetSymbol,
        name: strategy.targetSymbol,
        instrument_key: strategy.targetInstrumentKey || 'NSE_INDEX|Nifty 50',
      };
    }
    return POPULAR_NSE_STOCKS[0];
  });
  const [allStocks, setAllStocks] = useState<NseStock[]>(POPULAR_NSE_STOCKS);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);

  // Backtest Controls
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(
    strategy.timeframe || (isOrbStrategy ? '5m' : '1d')
  );
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);

  // Indicator Customization State
  const [enableAtr, setEnableAtr] = useState<boolean>(
    !isOrbStrategy && !isPsarStrategy && (strategy.defaultParams?.enableAtr ?? false)
  );
  const [indicatorSearchQuery, setIndicatorSearchQuery] = useState('');
  const [enabledIndicators, setEnabledIndicators] = useState<string[]>(
    isOrbStrategy ? [] : isPsarStrategy ? ['PSAR', 'SMA100'] : ['STOCHASTIC']
  );

  // ORB Visualizer Scenario State
  const [orbScenario, setOrbScenario] = useState<'BUY' | 'SELL'>('BUY');

  // Strategy Parameters State
  const [params, setParams] = useState<StrategyParams>({
    strategyType: isPsarStrategy ? 'PSAR_SMA100' : isOrbStrategy ? 'OPENING_RANGE' : 'STOCHASTIC',
    // PSAR + SMA100 Swing inputs (Institutional Defaults)
    tradeDir: (strategy.defaultParams?.tradeDir as any) ?? 'Buy Only',
    psarStart: strategy.defaultParams?.psarStart ?? 0.01,
    psarStep: strategy.defaultParams?.psarStep ?? 0.01,
    psarMax: strategy.defaultParams?.psarMax ?? 0.10,
    smaLength: strategy.defaultParams?.smaLength ?? 100,
    slLookback: strategy.defaultParams?.slLookback ?? 1,
    rrRatio: strategy.defaultParams?.rrRatio ?? 4.0,
    maxRiskPercent: strategy.defaultParams?.maxRiskPercent ?? 9.0,
    // ORB inputs
    orbTimeframeMinutes: 5,
    orbSlBodyPct: strategy.defaultParams?.orbSlBodyPct ?? 0.70,
    orbRiskReward: strategy.defaultParams?.orbRiskReward ?? 1.5,
    orbRiskPerTradeINR: strategy.defaultParams?.orbRiskPerTradeINR ?? 1000,
    // Stochastic & ATR inputs
    enableAtr: !isOrbStrategy && !isPsarStrategy && (strategy.defaultParams?.enableAtr ?? false),
    fixedSlPct: strategy.defaultParams?.fixedSlPct ?? 1.2,
    fixedTpPct: strategy.defaultParams?.fixedTpPct ?? 3.6,
    stochKPeriod: strategy.defaultParams?.stochKPeriod ?? 14,
    stochSmooth: strategy.defaultParams?.stochSmooth ?? 3,
    stochDPeriod: strategy.defaultParams?.stochDPeriod ?? 3,
    stochOverbought: strategy.defaultParams?.stochOverbought ?? 80,
    stochOversold: strategy.defaultParams?.stochOversold ?? 20,
    atrPeriod: strategy.defaultParams?.atrPeriod ?? (isOrbStrategy || isPsarStrategy ? 0 : 14),
    atrSlMultiplier: strategy.defaultParams?.atrSlMultiplier ?? (isOrbStrategy || isPsarStrategy ? 0 : 1.2),
    atrTpMultiplier: strategy.defaultParams?.atrTpMultiplier ?? (isOrbStrategy || isPsarStrategy ? 0 : 3.6),
    useTrailingStop: strategy.defaultParams?.useTrailingStop ?? false,
    initialCapital: strategy.defaultParams?.initialCapital ?? 100000,
    riskPerTradePct: strategy.defaultParams?.riskPerTradePct ?? (isPsarStrategy ? 3.0 : isOrbStrategy ? 1.0 : 2.0),
    slippagePoints: strategy.defaultParams?.slippagePoints ?? 1.0,
    brokeragePerOrder: 20,
    positionMode: 'BOTH',
    dataProvider: (strategy.defaultParams?.dataProvider as any) ?? 'yahoo',
    historyRange: (strategy.defaultParams?.historyRange as any) ?? 'max',
  });

  const [customFromDate, setCustomFromDate] = useState<string>('2018-01-01');
  const [customToDate, setCustomToDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Search input for sidebar
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');

  // Load all 3,797 NSE stocks + indices
  useEffect(() => {
    fetchAllNseStocks().then((stocks) => setAllStocks(stocks));
  }, []);

  const filteredStocks = allStocks
    .filter((s) => {
      if (stockCategoryTab === 'INDICES') {
        if (!s.isIndex && s.category !== 'INDEX') return false;
      } else if (stockCategoryTab === 'EQUITIES') {
        if (s.isIndex || s.category === 'INDEX') return false;
      }
      return (
        s.symbol.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(stockSearchQuery.toLowerCase())
      );
    })
    .slice(0, 40);

  // Synchronize when strategy prop changes
  useEffect(() => {
    const isOrb =
      strategy.category === 'Opening Range Breakout' ||
      strategy.defaultParams?.strategyType === 'OPENING_RANGE';
    const isPsar =
      strategy.id === 'algo-psar-sma100-swing' ||
      strategy.defaultParams?.strategyType === 'PSAR_SMA100' ||
      strategy.name.toLowerCase().includes('psar');

    const defaultTf = strategy.timeframe || (isOrb ? '5m' : '1d');
    setSelectedTimeframe(defaultTf);
    const atrActive = !isOrb && !isPsar && (strategy.defaultParams?.enableAtr ?? false);
    setEnableAtr(atrActive);
    setEnabledIndicators(
      isOrb ? [] : isPsar ? ['PSAR', 'SMA100'] : atrActive ? ['ATR', 'STOCHASTIC'] : ['STOCHASTIC']
    );

    if (strategy.targetSymbol) {
      const match = POPULAR_NSE_STOCKS.find((s) => s.symbol === strategy.targetSymbol);
      if (match) {
        setSelectedStock(match);
      } else {
        setSelectedStock({
          symbol: strategy.targetSymbol,
          name: strategy.targetSymbol,
          instrument_key: strategy.targetInstrumentKey || 'NSE_INDEX|Nifty 50',
        });
      }
    }

    setParams({
      strategyType: isPsar ? 'PSAR_SMA100' : isOrb ? 'OPENING_RANGE' : 'STOCHASTIC',
      tradeDir: (strategy.defaultParams?.tradeDir as any) ?? 'Buy Only',
      psarStart: strategy.defaultParams?.psarStart ?? 0.01,
      psarStep: strategy.defaultParams?.psarStep ?? 0.01,
      psarMax: strategy.defaultParams?.psarMax ?? 0.10,
      smaLength: strategy.defaultParams?.smaLength ?? 100,
      slLookback: strategy.defaultParams?.slLookback ?? 1,
      rrRatio: strategy.defaultParams?.rrRatio ?? 4.0,
      maxRiskPercent: strategy.defaultParams?.maxRiskPercent ?? 9.0,
      orbTimeframeMinutes: 5,
      orbSlBodyPct: strategy.defaultParams?.orbSlBodyPct ?? 0.70,
      orbRiskReward: strategy.defaultParams?.orbRiskReward ?? 1.5,
      orbRiskPerTradeINR: strategy.defaultParams?.orbRiskPerTradeINR ?? 1000,
      enableAtr: atrActive,
      fixedSlPct: strategy.defaultParams?.fixedSlPct ?? 1.2,
      fixedTpPct: strategy.defaultParams?.fixedTpPct ?? 3.6,
      stochKPeriod: strategy.defaultParams?.stochKPeriod ?? 14,
      stochSmooth: strategy.defaultParams?.stochSmooth ?? 3,
      stochDPeriod: strategy.defaultParams?.stochDPeriod ?? 3,
      stochOverbought: strategy.defaultParams?.stochOverbought ?? 80,
      stochOversold: strategy.defaultParams?.stochOversold ?? 20,
      atrPeriod: strategy.defaultParams?.atrPeriod ?? (isOrb || isPsar ? 0 : 14),
      atrSlMultiplier: strategy.defaultParams?.atrSlMultiplier ?? (isOrb || isPsar ? 0 : 1.2),
      atrTpMultiplier: strategy.defaultParams?.atrTpMultiplier ?? (isOrb || isPsar ? 0 : 3.6),
      useTrailingStop: strategy.defaultParams?.useTrailingStop ?? false,
      initialCapital: strategy.defaultParams?.initialCapital ?? 100000,
      riskPerTradePct: strategy.defaultParams?.riskPerTradePct ?? (isPsar ? 3.0 : isOrb ? 1.0 : 2.0),
      slippagePoints: strategy.defaultParams?.slippagePoints ?? 1.0,
      brokeragePerOrder: 20,
      positionMode: 'BOTH',
      dataProvider: (strategy.defaultParams?.dataProvider as any) ?? 'yahoo',
      historyRange: (strategy.defaultParams?.historyRange as any) ?? 'max',
    });
  }, [strategy.id]);

  // Fetch Candles on Mount, Stock, Timeframe, Provider, or Range Change
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setIsLoadingCandles(true);
      try {
        let data: Candle[] = [];
        if (selectedTimeframe === '1d') {
          // Free daily data from starting / inception date
          data = await fetchHistoricalDailyCandles({
            stock: selectedStock,
            provider: dataProvider,
            range: historyRange,
            customFromDate: historyRange === 'custom' ? customFromDate : undefined,
            customToDate: historyRange === 'custom' ? customToDate : undefined,
          });
        } else {
          // Intraday from Upstox
          data = await fetchUpstoxCandles({
            instrumentKey: selectedStock.instrument_key,
            timeframe: selectedTimeframe,
          });
        }
        if (isMounted) {
          setCandles(data);
          const result = runBacktest(data, params);
          setBacktestResult(result);
        }
      } catch (e) {
        console.error('Failed to fetch historical data:', e);
      } finally {
        if (isMounted) setIsLoadingCandles(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [selectedStock, selectedTimeframe, dataProvider, historyRange, customFromDate, customToDate]);

  // Dynamic recalculation when params change
  useEffect(() => {
    if (candles.length > 0) {
      const result = runBacktest(candles, params);
      setBacktestResult(result);
    }
  }, [params]);

  // Manual recalculation trigger
  const handleRecalculate = () => {
    if (candles.length > 0) {
      const result = runBacktest(candles, params);
      setBacktestResult(result);
    }
  };

  // Toggle ATR handler
  const handleToggleAtr = () => {
    const nextState = !enableAtr;
    setEnableAtr(nextState);
    setParams((prev) => ({
      ...prev,
      enableAtr: nextState,
      atrPeriod: nextState ? 14 : 0,
      atrSlMultiplier: nextState ? 1.5 : 0,
      atrTpMultiplier: nextState ? 3.0 : 0,
      useTrailingStop: nextState ? prev.useTrailingStop : false,
    }));
    if (nextState) {
      if (!enabledIndicators.includes('ATR')) {
        setEnabledIndicators([...enabledIndicators, 'ATR']);
      }
    } else {
      setEnabledIndicators(enabledIndicators.filter((i) => i !== 'ATR'));
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!backtestResult || backtestResult.trades.length === 0) return;
    const headers = 'ID,Type,Entry Time,Entry Price,Exit Time,Exit Price,Qty,Exit Reason,PnL (INR),PnL (%),ATR\n';
    const rows = backtestResult.trades
      .map(
        (t) =>
          `${t.id},${t.type},"${t.entryTime}",${t.entryPrice},"${t.exitTime}",${t.exitPrice},${t.qty},${t.exitReason},${t.pnl},${t.pnlPct}%,${t.atrAtEntry ?? 'N/A'}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${strategy.id}_${selectedStock.symbol}_Backtest_Trades.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Performance Chart: Real SVG Line Chart from Upstox Backtest Equity Curve
  const equityPoints = backtestResult?.equityCurve || [];
  const minEquity = equityPoints.length > 0 ? Math.min(...equityPoints.map((e) => e.equity)) : 95000;
  const maxEquity = equityPoints.length > 0 ? Math.max(...equityPoints.map((e) => e.equity)) : 105000;
  const eqRange = maxEquity - minEquity || 1;
  const chartW = 820;
  const chartH = 240;
  const padX = 40;
  const padY = 30;

  const dynamicCoords = equityPoints.map((e, idx) => {
    const x = padX + (idx / Math.max(1, equityPoints.length - 1)) * (chartW - padX * 2);
    const y = chartH - padY - ((e.equity - minEquity) / eqRange) * (chartH - padY * 2);
    return { x, y, equity: e.equity, time: e.time };
  });

  const dynamicPath = dynamicCoords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(' ');
  const dynamicArea = dynamicCoords.length > 0
    ? `${dynamicPath} L ${dynamicCoords[dynamicCoords.length - 1].x.toFixed(1)} ${chartH - padY} L ${dynamicCoords[0].x.toFixed(1)} ${chartH - padY} Z`
    : '';

  // Sample values for ORB 5M Visualizer (derived from current stock price)
  const basePrice = candles.length > 0 ? candles[0].close : 2500;
  const sampleOrbHigh = Number((basePrice * 1.004).toFixed(2));
  const sampleOrbLow = Number((basePrice * 0.996).toFixed(2));
  const sampleOrbOpen = Number((basePrice * 0.998).toFixed(2));
  const sampleOrbClose = Number((basePrice * 1.002).toFixed(2));
  const sampleOrbBody = Math.max(2, Math.abs(sampleOrbClose - sampleOrbOpen));
  const orbSlDistance = Number((sampleOrbBody * (params.orbSlBodyPct || 0.7)).toFixed(2));
  const orbTpDistance = Number((orbSlDistance * (params.orbRiskReward || 1.5)).toFixed(2));
  const orbRiskINR = params.orbRiskPerTradeINR || 1000;
  const orbQty = Math.max(1, Math.floor(orbRiskINR / orbSlDistance));
  const orbTargetProfit = Number((orbRiskINR * (params.orbRiskReward || 1.5)).toFixed(2));

  // Catalog of indicators for the optional search bar
  const AVAILABLE_INDICATORS = [
    { id: 'ATR', name: 'ATR (Average True Range)', desc: 'Volatility dynamic trailing stops' },
    { id: 'STOCHASTIC', name: 'Stochastic Oscillator', desc: '%K & %D momentum crossover' },
    { id: 'EMA', name: 'EMA Trend Filter (20/50)', desc: 'Exponential Moving Average trend lock' },
    { id: 'RSI', name: 'RSI (Relative Strength Index)', desc: 'Overbought / Oversold exhaustion' },
    { id: 'SUPERTREND', name: 'Supertrend Trailing', desc: 'Directional trend change trigger' },
    { id: 'MACD', name: 'MACD Signal Cross', desc: 'Moving average convergence divergence' },
    { id: 'VWAP', name: 'VWAP Institutional Anchor', desc: 'Volume weighted average price intraday' },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search & Most Deployed Algos Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search algorithm name, style..."
              value={sidebarSearchQuery}
              onChange={(e) => setSidebarSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-medium text-[#0A0A0D] placeholder-gray-400 focus:outline-none focus:border-black shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-bold text-[#0A0A0D] flex items-center gap-1.5">
                <span>★</span> Available Algorithms
              </span>
              <span className="text-[11px] font-mono text-gray-400">{availableStrategies.length} Active</span>
            </div>

            <div className="space-y-2">
              {availableStrategies
                .filter((s) => s.name.toLowerCase().includes(sidebarSearchQuery.toLowerCase()))
                .map((algo) => {
                  const isSelected = algo.id === strategy.id;
                  const isPos = algo.rollingReturn1m >= 0;
                  return (
                    <div
                      key={algo.id}
                      onClick={() => onSelectStrategy(algo)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-gray-50 border-black shadow-sm'
                          : 'bg-white border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-[#0A0A0D] line-clamp-1">{algo.name}</div>
                        <div className="text-[10px] text-gray-500 mt-0.5 font-medium">
                          {algo.category} · Min: ₹ {algo.marginRequired.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`text-xs font-mono font-bold flex items-center justify-end ${
                            isPos ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {algo.rollingReturn1m.toFixed(2)}%
                          {isPos ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                        </div>
                        <div className="text-[9px] text-gray-400">1m Rolling</div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </aside>

        {/* Right Main Column: Strategy Header, Stock Picker, Tabs & Performance */}
        <main className="lg:col-span-8 xl:col-span-9 bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-mono font-bold flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{toastMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setToastMessage(null)}
                className="text-gray-400 hover:text-black"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-100 gap-4">
            <div className="space-y-2">
              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-500 hover:text-black transition-colors mb-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Algorithm Marketplace</span>
                </button>
              )}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0A0A0D] flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                  {strategy.name.charAt(0)}
                </div>
                <div>
                  <h1 className="font-bold text-xl sm:text-2xl text-[#0A0A0D] tracking-tight">{strategy.name}</h1>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-1 font-medium">
                    <span>by Apex Quant Research</span>
                    <span>·</span>
                    <span className="font-bold text-black font-mono">NSE: {selectedStock.symbol}</span>
                    <span>·</span>
                    <span className="text-gray-600">{strategy.style}</span>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-mono text-[10px] font-bold">
                      {strategy.isInvestmentAlgo ? 'Automated Wealth' : 'Active Quant'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Min Investment Pill */}
              <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-right">
                <div className="text-[10px] text-gray-400 uppercase font-bold font-mono">Min. Capital</div>
                <div className="font-mono font-bold text-sm text-[#0A0A0D]">
                  ₹ {strategy.marginRequired.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Track List Bookmark Button */}
              <button
                type="button"
                onClick={handleToggleTrackList}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono border transition-all ${
                  isBookmarked
                    ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-black'
                }`}
                title={isBookmarked ? 'Remove from Track List' : 'Add to Track List'}
              >
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : 'text-gray-400'}`} />
                <span>{isBookmarked ? 'Tracked' : 'Track List'}</span>
              </button>

              {/* Deploy Strategy Button */}
              <button
                type="button"
                onClick={handleDeploy}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold font-mono rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Deploy Strategy</span>
              </button>

              {/* Interactive Backtest Button */}
              <button
                type="button"
                onClick={() => setActiveTab('backtest')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#0A0A0D] hover:bg-neutral-800 text-white text-xs font-bold font-mono rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Interactive Tuning</span>
              </button>
            </div>
          </div>

          {/* Active Testing Stock / Pair Dropdown (Select ANY from 3,797 NSE Stocks) */}
          <div className="bg-[#FAFAFC] p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Testing Stock / Pair:</span>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStockDropdownOpen(!isStockDropdownOpen)}
                  className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-black rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <StockLogo symbol={selectedStock.symbol} instrumentKey={selectedStock.instrument_key} name={selectedStock.name} size="xs" />
                  <span className="text-black font-mono">{selectedStock.symbol}</span>
                  <span className="text-gray-400">—</span>
                  <span className="text-gray-600 truncate max-w-[150px]">{selectedStock.name}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded font-mono">NSE</span>
                  <span className="text-gray-400 text-[10px]">▼</span>
                </button>

                {isStockDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-3 z-30 space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={stockSearchQuery}
                        onChange={(e) => setStockSearchQuery(e.target.value)}
                        placeholder="Search from 3,797 NSE stocks..."
                        className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                      {filteredStocks.map((stock) => (
                        <div
                          key={stock.symbol}
                          onClick={() => {
                            setSelectedStock(stock);
                            setIsStockDropdownOpen(false);
                            setStockSearchQuery('');
                          }}
                          className="p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <StockLogo symbol={stock.symbol} instrumentKey={stock.instrument_key} name={stock.name} size="xs" />
                            <div>
                              <span className="font-bold text-black">{stock.symbol}</span>
                              <span className="text-gray-500 ml-1.5 truncate max-w-[120px] inline-block">{stock.name}</span>
                            </div>
                          </div>
                          <span className="font-mono text-gray-600">₹{stock.last_price?.toFixed(2) || '0.00'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stock chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-gray-400 mr-1">Quick Select:</span>
              {POPULAR_NSE_STOCKS.slice(0, 8).map((stk) => (
                <button
                  key={stk.symbol}
                  onClick={() => setSelectedStock(stk)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                    selectedStock.symbol === stk.symbol
                      ? 'bg-black text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:text-black'
                  }`}
                >
                  {stk.symbol}
                </button>
              ))}
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex items-center gap-8 border-b border-gray-100 text-sm font-semibold">
            <button
              onClick={() => setActiveTab('performance')}
              className={`pb-3 transition-colors relative ${
                activeTab === 'performance' ? 'text-[#0A0A0D] border-b-2 border-[#0A0A0D]' : 'text-gray-500 hover:text-black'
              }`}
            >
              Quantitative Audit & Returns
            </button>
            <button
              onClick={() => setActiveTab('backtest')}
              className={`pb-3 transition-colors relative flex items-center gap-1.5 ${
                activeTab === 'backtest' ? 'text-[#0A0A0D] border-b-2 border-[#0A0A0D]' : 'text-gray-500 hover:text-black'
              }`}
            >
              <span>{isOrbStrategy ? 'ORB 5M Visualizer & Rules' : 'Strategy Tuning & Candlestick Feed'}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`pb-3 transition-colors relative ${
                activeTab === 'trades' ? 'text-[#0A0A0D] border-b-2 border-[#0A0A0D]' : 'text-gray-500 hover:text-black'
              }`}
            >
              Executed Trades Log {backtestResult && `(${backtestResult.trades.length})`}
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 transition-colors relative ${
                activeTab === 'about' ? 'text-[#0A0A0D] border-b-2 border-[#0A0A0D]' : 'text-gray-500 hover:text-black'
              }`}
            >
              About Algo & Source
            </button>
          </div>

          {/* TAB 1: QUANTITATIVE AUDIT & RETURNS */}
          {activeTab === 'performance' && (
            <StrategyQuantAudit
              strategy={strategy}
              selectedStock={selectedStock}
              allStrategies={availableStrategies}
              onSelectStrategy={onSelectStrategy}
              onDeploy={handleDeploy}
              backtestResult={backtestResult}
              candles={candles}
            />
          )}

          {/* TAB 2: INTERACTIVE BACKTEST & VISUALIZER */}
          {activeTab === 'backtest' && (
            <div className="space-y-6">
              {/* Top Controls: Timeframe, Data Provider & History Range */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAFAFC] border border-gray-200">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Timeframe */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0A0A0D]">{selectedStock.symbol} Timeframe:</span>
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                      {['1m', '5m', '15m', '30m', '1h', '4h', '1d'].map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                            selectedTimeframe === tf ? 'bg-[#0A0A0D] text-white' : 'text-gray-600 hover:text-black'
                          }`}
                        >
                          {tf.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Free Data Provider Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">Provider:</span>
                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                      <button
                        type="button"
                        onClick={() => setDataProvider('yahoo')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          dataProvider === 'yahoo' ? 'bg-[#0A0A0D] text-white' : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        <Globe className="w-3 h-3 text-emerald-400" />
                        <span>Yahoo Finance (Free Daily · Inception)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDataProvider('upstox')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          dataProvider === 'upstox' ? 'bg-[#0A0A0D] text-white' : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        <Database className="w-3 h-3 text-blue-400" />
                        <span>Upstox Live API</span>
                      </button>
                    </div>
                  </div>

                  {/* History Range (Active on 1d) */}
                  {selectedTimeframe === '1d' && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-gray-400">Range:</span>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                          {[
                            { id: 'max', label: 'Max (Inception)' },
                            { id: '10y', label: '10Y' },
                            { id: '5y', label: '5Y' },
                            { id: '3y', label: '3Y' },
                            { id: '1y', label: '1Y' },
                            { id: '300d', label: '300D' },
                            { id: 'custom', label: 'Custom' },
                          ].map((rng) => (
                            <button
                              key={rng.id}
                              type="button"
                              onClick={() => setHistoryRange(rng.id as any)}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                                historyRange === rng.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
                              }`}
                            >
                              {rng.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {historyRange === 'custom' && (
                        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-sm">
                          <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">From:</span>
                          <input
                            type="date"
                            value={customFromDate}
                            onChange={(e) => setCustomFromDate(e.target.value)}
                            className="bg-transparent text-xs font-mono font-bold text-black focus:outline-none"
                          />
                          <span className="text-[10px] font-bold text-gray-400 uppercase font-mono ml-1">To:</span>
                          <input
                            type="date"
                            value={customToDate}
                            onChange={(e) => setCustomToDate(e.target.value)}
                            className="bg-transparent text-xs font-mono font-bold text-black focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>
                      {selectedTimeframe === '1d' && dataProvider === 'yahoo'
                        ? `Yahoo Finance Free Daily (${candles.length} Candles)`
                        : `Upstox Feed (${candles.length} Candles)`}
                    </span>
                  </span>

                  <button
                    onClick={handleRecalculate}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0A0A0D] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-neutral-800 active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Recalculate Engine</span>
                  </button>
                </div>
              </div>

              {/* SECTION A: OPENING RANGE BREAKOUT INTERACTIVE VISUALIZER (WHEN ORB STRATEGY) */}
              {isOrbStrategy && (
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6">
                  {/* Visualizer Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-sm text-[#0A0A0D] flex items-center gap-2">
                        <Crosshair className="w-4 h-4 text-emerald-600" />
                        ORB 5M Trade Visualizer & Execution Architecture
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        09:15-09:20 Range · Dual Stop Orders · 70% Body SL · 1:1.5 RR · Zero ATR
                      </p>
                    </div>

                    {/* Scenario Toggle */}
                    <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
                      <button
                        onClick={() => setOrbScenario('BUY')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          orbScenario === 'BUY' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Bullish Breakout (Buy Stop)</span>
                      </button>
                      <button
                        onClick={() => setOrbScenario('SELL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          orbScenario === 'SELL' ? 'bg-white text-rose-700 shadow-sm' : 'text-gray-500 hover:text-black'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>Bearish Breakout (Sell Stop)</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Visual Canvas SVG */}
                  <div className="bg-[#FAFAFC] p-4 rounded-xl border border-gray-200 overflow-hidden">
                    <svg viewBox="0 0 800 280" className="w-full h-auto select-none overflow-visible">
                      {/* Gridlines */}
                      <line x1="40" y1="50" x2="760" y2="50" stroke="#E2E8F0" strokeDasharray="3 3" />
                      <line x1="40" y1="110" x2="760" y2="110" stroke="#E2E8F0" strokeDasharray="3 3" />
                      <line x1="40" y1="170" x2="760" y2="170" stroke="#E2E8F0" strokeDasharray="3 3" />
                      <line x1="40" y1="230" x2="760" y2="230" stroke="#E2E8F0" strokeDasharray="3 3" />

                      {/* --- CANDLE 1: 09:15 - 09:20 AM FIRST 5-MINUTE CANDLE --- */}
                      <g>
                        {/* 5M Box Range Shading */}
                        <rect x="80" y="60" width="140" height="150" fill="#F1F5F9" rx="8" stroke="#CBD5E1" strokeDasharray="2 2" />
                        <text x="150" y="45" fontSize="10" fontFamily="sans-serif" fontWeight="bold" fill="#0A0A0D" textAnchor="middle">
                          09:15 - 09:20 AM (5M Range)
                        </text>

                        {/* Candle 1 Wick */}
                        <line x1="150" y1="65" x2="150" y2="205" stroke="#16A34A" strokeWidth="2" />
                        {/* Candle 1 Body */}
                        <rect x="132" y="90" width="36" height="85" fill="#16A34A" rx="2" />

                        {/* High Marker Line */}
                        <line x1="150" y1="65" x2="760" y2="65" stroke="#16A34A" strokeWidth="1.5" strokeDasharray="4 4" />
                        <rect x="180" y="52" width="170" height="20" fill="#DCFCE7" rx="4" />
                        <text x="188" y="66" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#166534">
                          BUY STOP TRIGGER @ High (₹{sampleOrbHigh})
                        </text>

                        {/* Low Marker Line */}
                        <line x1="150" y1="205" x2="760" y2="205" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="4 4" />
                        <rect x="180" y="195" width="170" height="20" fill="#FEE2E2" rx="4" />
                        <text x="188" y="209" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#991B1B">
                          SELL STOP TRIGGER @ Low (₹{sampleOrbLow})
                        </text>

                        {/* 5M Body Bracket Indicator */}
                        <line x1="110" y1="90" x2="110" y2="175" stroke="#64748B" strokeWidth="2" />
                        <text x="102" y="136" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#64748B" textAnchor="end">
                          Body = ₹{sampleOrbBody}
                        </text>
                      </g>

                      {/* --- CANDLE 2: 09:20 - 09:25 AM BREAKOUT TRIGGER CANDLE --- */}
                      {orbScenario === 'BUY' ? (
                        <g>
                          {/* Candle 2 Bullish Breakout */}
                          <line x1="330" y1="50" x2="330" y2="105" stroke="#16A34A" strokeWidth="2" />
                          <rect x="316" y="55" width="28" height="45" fill="#16A34A" rx="2" />

                          {/* Breakout execution pin */}
                          <circle cx="330" cy="65" r="5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
                          <rect x="345" y="48" width="150" height="22" fill="#0A0A0D" rx="6" />
                          <text x="352" y="63" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#FFFFFF">
                            09:21 AM BUY ENTRY TRIGGERED
                          </text>

                          {/* Stop Loss Line at 70% Body */}
                          <line x1="330" y1="150" x2="760" y2="150" stroke="#DC2626" strokeWidth="2" strokeDasharray="4 4" />
                          <rect x="520" y="140" width="220" height="20" fill="#FEE2E2" rx="4" />
                          <text x="528" y="154" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#991B1B">
                            STOP LOSS @ 70% Body (-₹{orbRiskINR})
                          </text>

                          {/* Target Line at 1:1.5 RR */}
                          <line x1="330" y1="20" x2="760" y2="20" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
                          <rect x="520" y="10" width="220" height="20" fill="#DCFCE7" rx="4" />
                          <text x="528" y="24" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#166534">
                            TARGET 1:1.5 RR (+₹{orbTargetProfit})
                          </text>

                          {/* Candle 3 Target Continuation */}
                          <line x1="470" y1="18" x2="470" y2="70" stroke="#16A34A" strokeWidth="2" />
                          <rect x="456" y="20" width="28" height="42" fill="#16A34A" rx="2" />
                          <circle cx="470" cy="20" r="5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
                          <text x="470" y="10" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#16A34A" textAnchor="middle">
                            TARGET HIT (+₹{orbTargetProfit})
                          </text>
                        </g>
                      ) : (
                        <g>
                          {/* Candle 2 Bearish Breakout */}
                          <line x1="330" y1="190" x2="330" y2="245" stroke="#DC2626" strokeWidth="2" />
                          <rect x="316" y="195" width="28" height="45" fill="#DC2626" rx="2" />

                          {/* Breakout execution pin */}
                          <circle cx="330" cy="205" r="5" fill="#DC2626" stroke="#FFFFFF" strokeWidth="2" />
                          <rect x="345" y="198" width="155" height="22" fill="#0A0A0D" rx="6" />
                          <text x="352" y="213" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#FFFFFF">
                            09:21 AM SELL ENTRY TRIGGERED
                          </text>

                          {/* Stop Loss Line at 70% Body */}
                          <line x1="330" y1="120" x2="760" y2="120" stroke="#DC2626" strokeWidth="2" strokeDasharray="4 4" />
                          <rect x="520" y="110" width="220" height="20" fill="#FEE2E2" rx="4" />
                          <text x="528" y="124" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#991B1B">
                            STOP LOSS @ 70% Body (-₹{orbRiskINR})
                          </text>

                          {/* Target Line at 1:1.5 RR */}
                          <line x1="330" y1="260" x2="760" y2="260" stroke="#16A34A" strokeWidth="2" strokeDasharray="4 4" />
                          <rect x="520" y="250" width="220" height="20" fill="#DCFCE7" rx="4" />
                          <text x="528" y="264" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#166534">
                            TARGET 1:1.5 RR (+₹{orbTargetProfit})
                          </text>

                          {/* Candle 3 Target Continuation */}
                          <line x1="470" y1="210" x2="470" y2="262" stroke="#DC2626" strokeWidth="2" />
                          <rect x="456" y="215" width="28" height="45" fill="#DC2626" rx="2" />
                          <circle cx="470" cy="260" r="5" fill="#16A34A" stroke="#FFFFFF" strokeWidth="2" />
                          <text x="470" y="275" fontSize="9" fontFamily="sans-serif" fontWeight="bold" fill="#16A34A" textAnchor="middle">
                            TARGET HIT (+₹{orbTargetProfit})
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>

                  {/* Operational Mechanics Callouts (5 Steps) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">Step 1: 09:15-09:20 AM</span>
                      <span className="text-gray-600 block text-[11px]">
                        Mark High & Low of the first 5M candle on {selectedStock.symbol}. Measure candle body.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">Step 2: 09:20 AM Sharp</span>
                      <span className="text-gray-600 block text-[11px]">
                        Place dual bracket stop orders: Buy Stop at High, Sell Stop at Low (OCO order).
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">Step 3: Breakout Trigger</span>
                      <span className="text-gray-600 block text-[11px]">
                        First order triggered enters the market. Opposite stop order is instantly cancelled.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">Step 4: 70% Body SL</span>
                      <span className="text-gray-600 block text-[11px]">
                        Stop Loss placed at exactly 70% of 5M body depth. Sizing locked to ₹{orbRiskINR} max risk.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">Step 5: 1:1.5 RR Target</span>
                      <span className="text-gray-600 block text-[11px]">
                        Target locked at 1.5x risk distance (+₹{orbTargetProfit}). Intraday square-off at 15:15 IST.
                      </span>
                    </div>
                  </div>

                  {/* Calibration Sliders for ORB */}
                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs">
                      <span className="font-bold text-[#0A0A0D] flex items-center gap-2">
                        <Sliders className="w-4 h-4" />
                        ORB 5M Parameter Calibration
                      </span>
                      <span className="font-mono text-gray-500">Pure Price Action</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                      {/* Body SL % */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Stop Loss Body %:</span>
                          <span className="font-bold text-black">{Math.round((params.orbSlBodyPct || 0.7) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="1.0"
                          step="0.05"
                          value={params.orbSlBodyPct || 0.7}
                          onChange={(e) => setParams({ ...params, orbSlBodyPct: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* Risk Reward */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Risk-to-Reward:</span>
                          <span className="font-bold text-black">1 : {params.orbRiskReward || 1.5}</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="3.0"
                          step="0.1"
                          value={params.orbRiskReward || 1.5}
                          onChange={(e) => setParams({ ...params, orbRiskReward: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* Risk INR per trade */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Risk Per Trade:</span>
                          <span className="font-bold text-black">₹{params.orbRiskPerTradeINR || 1000}</span>
                        </div>
                        <input
                          type="range"
                          min="500"
                          max="5000"
                          step="250"
                          value={params.orbRiskPerTradeINR || 1000}
                          onChange={(e) => setParams({ ...params, orbRiskPerTradeINR: parseInt(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* Position Sizing Output */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="text-gray-500 text-[10px]">Calculated Qty on ₹1L:</div>
                        <div className="font-bold text-black text-sm">{orbQty} Shares</div>
                        <div className="text-[10px] text-emerald-600">Target Profit: +₹{orbTargetProfit}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: PSAR + SMA100 SWING VISUALIZER & ARCHITECTURE (PINE SCRIPT © ATHARVA BHOSALE) */}
              {isPsarStrategy && (
                <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-6">
                  {/* Visualizer Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div>
                      <h3 className="font-bold text-sm text-[#0A0A0D] flex items-center gap-2">
                        <Compass className="w-4 h-4 text-emerald-600" />
                        PSAR + SMA100 Swing Execution Architecture & Calibration
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        TradingView Pine Script v5 · © Atharva Bhosale · Parabolic SAR Flip · SMA 100 Filter · 2-Bar Lookback SL · 1:2.0 RR · 2-Bar Timeout
                      </p>
                    </div>

                    {/* Trade Direction Toggle & View Pine Script */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl">
                        {(['Both', 'Buy Only', 'Sell Only'] as const).map((dir) => (
                          <button
                            key={dir}
                            type="button"
                            onClick={() => setParams({ ...params, tradeDir: dir })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              (params.tradeDir || 'Both') === dir
                                ? 'bg-black text-white shadow-sm'
                                : 'text-gray-600 hover:text-black'
                            }`}
                          >
                            {dir}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(PINE_SCRIPT_SOURCE);
                          setHasCopiedCode(true);
                          setTimeout(() => setHasCopiedCode(false), 2000);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all border border-gray-200"
                        title="Copy Pine Script Code"
                      >
                        {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{hasCopiedCode ? 'Copied Pine Script' : 'Copy Script'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 6 Strategy Execution Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">1. SMA 100 Filter</span>
                      <span className="text-gray-600 block text-[11px]">
                        sma100 &gt; sma100[1] = Rising (Longs only). Falling = Shorts only.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">2. PSAR Flip</span>
                      <span className="text-gray-600 block text-[11px]">
                        PSAR flips below low (Buy) or above high (Sell) with aligned SMA trend.
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">3. Stop Orders</span>
                      <span className="text-gray-600 block text-[11px]">
                        Pending Stop order placed at signal candle High (Long) / Low (Short).
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">4. N-Bar SL</span>
                      <span className="text-gray-600 block text-[11px]">
                        Stop Loss locked at Low/High of N candles back (default 2 bars back).
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">5. 1:2.0 RR Target</span>
                      <span className="text-gray-600 block text-[11px]">
                        Profit target placed at 2.0x Risk distance (1:2.0 Risk-to-Reward).
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                      <span className="font-bold text-[#0A0A0D] block mb-1">6. 2-Bar Timeout</span>
                      <span className="text-gray-600 block text-[11px]">
                        Pending order automatically cancelled if not filled within 2 bars.
                      </span>
                    </div>
                  </div>

                  {/* Calibration Sliders for PSAR + SMA100 */}
                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200 text-xs">
                      <span className="font-bold text-[#0A0A0D] flex items-center gap-2">
                        <Sliders className="w-4 h-4" />
                        PSAR + SMA100 Parameter Calibration
                      </span>
                      <span className="font-mono text-gray-500">Direction: {params.tradeDir || 'Both'}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
                      {/* PSAR Start */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>PSAR Start (AF):</span>
                          <span className="font-bold text-black">{params.psarStart ?? 0.01}</span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.05"
                          step="0.005"
                          value={params.psarStart ?? 0.01}
                          onChange={(e) => setParams({ ...params, psarStart: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* PSAR Increment Step */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>PSAR Step (AF Inc):</span>
                          <span className="font-bold text-black">{params.psarStep ?? 0.01}</span>
                        </div>
                        <input
                          type="range"
                          min="0.005"
                          max="0.05"
                          step="0.005"
                          value={params.psarStep ?? 0.01}
                          onChange={(e) => setParams({ ...params, psarStep: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* PSAR Max */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>PSAR Max (AF):</span>
                          <span className="font-bold text-black">{params.psarMax ?? 0.10}</span>
                        </div>
                        <input
                          type="range"
                          min="0.05"
                          max="0.30"
                          step="0.01"
                          value={params.psarMax ?? 0.10}
                          onChange={(e) => setParams({ ...params, psarMax: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* SMA Length */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>SMA Length:</span>
                          <span className="font-bold text-black">{params.smaLength ?? 100}</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="200"
                          step="5"
                          value={params.smaLength ?? 100}
                          onChange={(e) => setParams({ ...params, smaLength: parseInt(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* SL Lookback Bars */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>SL Lookback Candles:</span>
                          <span className="font-bold text-black">{params.slLookback ?? 2} bars back</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={params.slLookback ?? 2}
                          onChange={(e) => setParams({ ...params, slLookback: parseInt(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* Risk : Reward Ratio */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Risk : Reward Ratio:</span>
                          <span className="font-bold text-black">1 : {params.rrRatio ?? 2.0}</span>
                        </div>
                        <input
                          type="range"
                          min="1.0"
                          max="4.0"
                          step="0.1"
                          value={params.rrRatio ?? 2.0}
                          onChange={(e) => setParams({ ...params, rrRatio: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* Max Risk % */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Max Risk % per Trade:</span>
                          <span className="font-bold text-black">{params.maxRiskPercent ?? 9.0}%</span>
                        </div>
                        <input
                          type="range"
                          min="2.0"
                          max="15.0"
                          step="0.5"
                          value={params.maxRiskPercent ?? 9.0}
                          onChange={(e) => setParams({ ...params, maxRiskPercent: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>

                      {/* Risk Per Trade % */}
                      <div className="space-y-1 p-3 rounded-xl bg-white border border-gray-200">
                        <div className="flex justify-between text-gray-600">
                          <span>Risk Per Trade:</span>
                          <span className="font-bold text-black">{params.riskPerTradePct ?? 1.0}% (₹{Math.round(params.initialCapital * ((params.riskPerTradePct ?? 1.0) / 100))})</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3.0"
                          step="0.1"
                          value={params.riskPerTradePct ?? 1.0}
                          onChange={(e) => setParams({ ...params, riskPerTradePct: parseFloat(e.target.value) })}
                          className="w-full accent-black cursor-pointer h-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: STOCHASTIC & ATR CONTROLS (WITH ATR DISABLE BUTTON & INDICATOR SEARCH) */}
              {!isOrbStrategy && !isPsarStrategy && (
                <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
                  {/* ATR Toggle Bar & Indicator Search */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xs text-[#0A0A0D] flex items-center gap-2">
                        <SlidersHorizontal className="w-4 h-4" />
                        Indicators & Volatility Configuration
                      </span>

                      {/* Direct Prominent ATR Toggle Button */}
                      <button
                        type="button"
                        onClick={handleToggleAtr}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          enableAtr
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-sm'
                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${enableAtr ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        <span>ATR Stops: {enableAtr ? 'ENABLED (Trailing Active)' : 'DISABLED (Pure Crossover)'}</span>
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-gray-400">Admin Indicator Studio</span>
                  </div>

                  {/* Indicator Search & Quick Toggle Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search indicator to add (e.g. ATR, EMA, RSI, Supertrend)..."
                          value={indicatorSearchQuery}
                          onChange={(e) => setIndicatorSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    {/* Indicator Badges List */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {AVAILABLE_INDICATORS.filter(
                        (ind) =>
                          ind.name.toLowerCase().includes(indicatorSearchQuery.toLowerCase()) ||
                          ind.desc.toLowerCase().includes(indicatorSearchQuery.toLowerCase())
                      ).map((ind) => {
                        const isIndActive =
                          ind.id === 'ATR' ? enableAtr : enabledIndicators.includes(ind.id);
                        return (
                          <button
                            key={ind.id}
                            type="button"
                            onClick={() => {
                              if (ind.id === 'ATR') {
                                handleToggleAtr();
                              } else {
                                if (enabledIndicators.includes(ind.id)) {
                                  setEnabledIndicators(enabledIndicators.filter((x) => x !== ind.id));
                                } else {
                                  setEnabledIndicators([...enabledIndicators, ind.id]);
                                }
                              }
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
                              isIndActive
                                ? 'bg-black text-white border-black shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <span>{ind.name}</span>
                            <span className="text-[10px]">{isIndActive ? '✓' : '+'}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Parameters Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono pt-2">
                    {/* Stoch %K */}
                    <div className="space-y-1 p-3 rounded-xl bg-[#FAFAFC] border border-gray-100">
                      <div className="flex justify-between text-gray-600">
                        <span>Stoch %K Period:</span>
                        <span className="font-bold text-[#0A0A0D]">{params.stochKPeriod}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="30"
                        value={params.stochKPeriod}
                        onChange={(e) => setParams({ ...params, stochKPeriod: parseInt(e.target.value) })}
                        className="w-full accent-black cursor-pointer h-1"
                      />
                    </div>

                    {/* Stoch %D */}
                    <div className="space-y-1 p-3 rounded-xl bg-[#FAFAFC] border border-gray-100">
                      <div className="flex justify-between text-gray-600">
                        <span>Stoch %D Period:</span>
                        <span className="font-bold text-[#0A0A0D]">{params.stochDPeriod}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        value={params.stochDPeriod}
                        onChange={(e) => setParams({ ...params, stochDPeriod: parseInt(e.target.value) })}
                        className="w-full accent-black cursor-pointer h-1"
                      />
                    </div>

                    {/* Conditional ATR vs Fixed SL/TP Sliders */}
                    {enableAtr ? (
                      <>
                        {/* ATR SL */}
                        <div className="space-y-1 p-3 rounded-xl bg-[#FAFAFC] border border-gray-100">
                          <div className="flex justify-between text-gray-600">
                            <span>ATR Stop Loss:</span>
                            <span className="font-bold text-[#0A0A0D]">{params.atrSlMultiplier}x</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="3.5"
                            step="0.1"
                            value={params.atrSlMultiplier}
                            onChange={(e) => setParams({ ...params, atrSlMultiplier: parseFloat(e.target.value) })}
                            className="w-full accent-black cursor-pointer h-1"
                          />
                        </div>

                        {/* ATR TP */}
                        <div className="space-y-1 p-3 rounded-xl bg-[#FAFAFC] border border-gray-100">
                          <div className="flex justify-between text-gray-600">
                            <span>ATR Take Profit:</span>
                            <span className="font-bold text-[#0A0A0D]">{params.atrTpMultiplier}x</span>
                          </div>
                          <input
                            type="range"
                            min="1.5"
                            max="5.0"
                            step="0.2"
                            value={params.atrTpMultiplier}
                            onChange={(e) => setParams({ ...params, atrTpMultiplier: parseFloat(e.target.value) })}
                            className="w-full accent-black cursor-pointer h-1"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Fixed SL % */}
                        <div className="space-y-1 p-3 rounded-xl bg-[#FAFAFC] border border-gray-100">
                          <div className="flex justify-between text-gray-600">
                            <span>Fixed Stop Loss %:</span>
                            <span className="font-bold text-[#0A0A0D]">{params.fixedSlPct || 1.0}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.1"
                            value={params.fixedSlPct || 1.0}
                            onChange={(e) => setParams({ ...params, fixedSlPct: parseFloat(e.target.value) })}
                            className="w-full accent-black cursor-pointer h-1"
                          />
                        </div>

                        {/* Fixed TP % */}
                        <div className="space-y-1 p-3 rounded-xl bg-[#FAFAFC] border border-gray-100">
                          <div className="flex justify-between text-gray-600">
                            <span>Fixed Target %:</span>
                            <span className="font-bold text-[#0A0A0D]">{params.fixedTpPct || 2.0}%</span>
                          </div>
                          <input
                            type="range"
                            min="1.0"
                            max="5.0"
                            step="0.2"
                            value={params.fixedTpPct || 2.0}
                            onChange={(e) => setParams({ ...params, fixedTpPct: parseFloat(e.target.value) })}
                            className="w-full accent-black cursor-pointer h-1"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Candlestick & Indicator Chart Container */}
              <div className="p-4 rounded-2xl bg-[#FAFAFC] border border-gray-200 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-gray-600">
                  <span className="font-bold text-[#0A0A0D] flex items-center gap-2">
                    {selectedStock.symbol} Candlestick Chart ({dataProvider === 'yahoo' && selectedTimeframe === '1d' ? 'Yahoo Finance Historical Feed' : 'Upstox Feed'})
                  </span>
                  <div className="flex items-center gap-4 text-[11px]">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-emerald-600 rounded-sm" />
                      <span>Bullish / BUY</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-rose-600 rounded-sm" />
                      <span>Bearish / EXIT</span>
                    </span>
                    {isPsarStrategy && (
                      <>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-0.5 bg-blue-600 rounded" />
                          <span>SMA 100</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-slate-500 rounded-full" />
                          <span>PSAR</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Candlestick SVG */}
                <div className="bg-white rounded-xl border border-gray-200 p-3 overflow-hidden">
                  {candles.length > 0 ? (
                    <svg viewBox="0 0 800 240" className="w-full h-auto max-h-[260px] select-none cursor-crosshair">
                      {[0.25, 0.5, 0.75].map((r) => (
                        <line key={r} x1="0" y1={240 * r} x2="800" y2={240 * r} stroke="#F1F5F9" strokeDasharray="2 4" />
                      ))}

                      {(() => {
                        const slice = candles.slice(-50);
                        let min = Math.min(...slice.map((c) => c.low));
                        let max = Math.max(...slice.map((c) => c.high));

                        if (isPsarStrategy) {
                          for (const c of slice) {
                            if (c.sma100) {
                              min = Math.min(min, c.sma100);
                              max = Math.max(max, c.sma100);
                            }
                            if (c.psar) {
                              min = Math.min(min, c.psar);
                              max = Math.max(max, c.psar);
                            }
                          }
                        }

                        const range = max - min || 1;
                        const w = 800 / slice.length;

                        // Build SMA line path
                        const smaPoints = isPsarStrategy
                          ? slice
                              .map((c, i) => {
                                if (c.sma100 === undefined) return null;
                                const x = i * w + w / 2;
                                const y = 220 - ((c.sma100 - min) / range) * 200;
                                return `${x},${y}`;
                              })
                              .filter(Boolean)
                              .join(' ')
                          : '';

                        return (
                          <>
                            {slice.map((c, i) => {
                              const x = i * w + w / 2;
                              const isGreen = c.close >= c.open;
                              const highY = 220 - ((c.high - min) / range) * 200;
                              const lowY = 220 - ((c.low - min) / range) * 200;
                              const openY = 220 - ((c.open - min) / range) * 200;
                              const closeY = 220 - ((c.close - min) / range) * 200;
                              const topY = Math.min(openY, closeY);
                              const bodyH = Math.max(2, Math.abs(openY - closeY));

                              const psarY = c.psar !== undefined ? 220 - ((c.psar - min) / range) * 200 : null;

                              const trade = backtestResult?.trades.find((t) => t.entryTime === c.time || t.exitTime === c.time);

                              return (
                                <g key={i}>
                                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={isGreen ? '#16A34A' : '#DC2626'} strokeWidth="1" />
                                  <rect x={x - 4} y={topY} width="8" height={bodyH} fill={isGreen ? '#16A34A' : '#DC2626'} rx="1" />
                                  {/* PSAR Dot */}
                                  {isPsarStrategy && psarY !== null && (
                                    <circle cx={x} cy={psarY} r="2.5" fill="#475569" opacity="0.85" />
                                  )}
                                  {trade && (
                                    <circle
                                      cx={x}
                                      cy={trade.entryTime === c.time ? highY - 10 : lowY + 10}
                                      r="4"
                                      fill={trade.type === 'BUY' ? '#16A34A' : '#0A0A0D'}
                                      stroke="#FFFFFF"
                                      strokeWidth="1.5"
                                    />
                                  )}
                                </g>
                              );
                            })}

                            {/* SMA 100 Line */}
                            {isPsarStrategy && smaPoints && (
                              <polyline points={smaPoints} fill="none" stroke="#2563EB" strokeWidth="2" opacity="0.8" />
                            )}
                          </>
                        );
                      })()}
                    </svg>
                  ) : (
                    <div className="py-16 text-center text-gray-400 text-xs font-mono">
                      {isLoadingCandles ? 'Fetching candles...' : 'No candle data available.'}
                    </div>
                  )}
                </div>

                {/* PSAR Indicator State Bar */}
                {isPsarStrategy && (
                  <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-bold text-[#0A0A0D]">
                        <span className="w-3 h-0.5 bg-blue-600 inline-block rounded" />
                        SMA 100: {candles.length > 0 && candles[candles.length - 1].sma100 ? `₹${candles[candles.length - 1].sma100}` : 'Active'}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                        PSAR: {candles.length > 0 && candles[candles.length - 1].psar ? `₹${candles[candles.length - 1].psar}` : 'Active'}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Direction: {params.tradeDir || 'Both'} · SL: {params.slLookback || 2} Bars · Risk: {params.riskPerTradePct || 1}% · RR: 1:{params.rrRatio || 2.0}
                    </div>
                  </div>
                )}

                {/* Stochastic Indicator Sub-Chart (ONLY rendered for Stochastic strategy) */}
                {!isOrbStrategy && !isPsarStrategy && (
                  <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-gray-500">
                      <span className="font-bold text-[#0A0A0D]">
                        Stochastic Oscillator (%K {params.stochKPeriod}, %D {params.stochDPeriod})
                      </span>
                      <span className="text-gray-400">Overbought: 80 | Oversold: 20</span>
                    </div>

                    <svg viewBox="0 0 800 70" className="w-full h-auto max-h-[80px]">
                      <line x1="0" y1="14" x2="800" y2="14" stroke="#CBD5E1" strokeDasharray="3 3" />
                      <line x1="0" y1="56" x2="800" y2="56" stroke="#CBD5E1" strokeDasharray="3 3" />

                      {(() => {
                        const slice = candles.slice(-50);
                        if (slice.length === 0) return null;
                        const w = 800 / slice.length;

                        const kPoints = slice
                          .map((c, i) => {
                            const val = c.stochK ?? 50;
                            const x = i * w + w / 2;
                            const y = 70 - (val / 100) * 70;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          })
                          .join(' ');

                        const dPoints = slice
                          .map((c, i) => {
                            const val = c.stochD ?? 50;
                            const x = i * w + w / 2;
                            const y = 70 - (val / 100) * 70;
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                          })
                          .join(' ');

                        return (
                          <>
                            <path d={kPoints} fill="none" stroke="#0A0A0D" strokeWidth="1.8" />
                            <path d={dPoints} fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>

              {/* Metric Cards Output */}
              {backtestResult && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200">
                    <span className="text-[10px] text-gray-500 block font-semibold">TOTAL RETURN</span>
                    <span
                      className={`text-lg font-bold font-mono ${
                        backtestResult.metrics.totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {backtestResult.metrics.totalReturn >= 0 ? '+' : ''}
                      {backtestResult.metrics.totalReturnPct}%
                    </span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      ₹ {backtestResult.metrics.totalReturn.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200">
                    <span className="text-[10px] text-gray-500 block font-semibold">WIN RATE</span>
                    <span className="text-lg font-bold font-mono text-[#0A0A0D]">{backtestResult.metrics.winRate}%</span>
                    <span className="text-[10px] text-gray-400 block font-mono">
                      {backtestResult.metrics.winningTrades} / {backtestResult.metrics.totalTrades} Wins
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200">
                    <span className="text-[10px] text-gray-500 block font-semibold">PROFIT FACTOR</span>
                    <span className="text-lg font-bold font-mono text-[#0A0A0D]">{backtestResult.metrics.profitFactor}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">Gross Win/Loss</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200">
                    <span className="text-[10px] text-gray-500 block font-semibold">MAX DRAWDOWN</span>
                    <span className="text-lg font-bold font-mono text-rose-600">-{backtestResult.metrics.maxDrawdownPct}%</span>
                    <span className="text-[10px] text-gray-400 block font-mono">Peak Retracement</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200">
                    <span className="text-[10px] text-gray-500 block font-semibold">SHARPE RATIO</span>
                    <span className="text-lg font-bold font-mono text-[#0A0A0D]">{backtestResult.metrics.sharpeRatio}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">Annualized</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAFAFC] border border-gray-200">
                    <span className="text-[10px] text-gray-500 block font-semibold">TOTAL TRADES</span>
                    <span className="text-lg font-bold font-mono text-[#0A0A0D]">{backtestResult.metrics.totalTrades}</span>
                    <span className="text-[10px] text-gray-400 block font-mono">30-Day Total</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: TRADES LOG */}
          {activeTab === 'trades' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#0A0A0D]">Executed Backtest Trades Log</h4>
                  <p className="text-xs text-gray-500">
                    Chronological trades executed on Upstox real market data for {selectedStock.symbol}
                  </p>
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={!backtestResult || backtestResult.trades.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-black rounded-lg text-xs font-semibold text-gray-700 hover:text-black transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>

              {backtestResult && backtestResult.trades.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAFAFC] text-gray-500 uppercase font-mono text-[10px] border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Trade ID</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Entry Time</th>
                        <th className="py-2.5 px-3">Entry Price</th>
                        <th className="py-2.5 px-3">Exit Time</th>
                        <th className="py-2.5 px-3">Exit Price</th>
                        <th className="py-2.5 px-3">Reason</th>
                        <th className="py-2.5 px-3 text-right">Net P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-mono">
                      {backtestResult.trades.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50">
                          <td className="py-2.5 px-3 font-bold">{t.id}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.type === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-gray-600">{t.entryTime}</td>
                          <td className="py-2.5 px-3">₹{t.entryPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-gray-600">{t.exitTime}</td>
                          <td className="py-2.5 px-3">₹{t.exitPrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-gray-500 text-[10px]">{t.exitReason}</td>
                          <td
                            className={`py-2.5 px-3 text-right font-bold ${
                              t.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toFixed(2)} ({t.pnlPct.toFixed(2)}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-gray-400 font-mono">
                  No trades recorded. Click "Interactive Backtest" and "Recalculate Engine" to generate trades.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ABOUT ALGO */}
          {activeTab === 'about' && (
            <div className="space-y-6 text-xs text-gray-700">
              {isPsarStrategy && (
                <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0A0A0D] flex items-center gap-2">
                      <Code className="w-4 h-4 text-emerald-600" />
                      TradingView Pine Script v5 Source Code (© Atharva Bhosale)
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(PINE_SCRIPT_SOURCE);
                        setHasCopiedCode(true);
                        setTimeout(() => setHasCopiedCode(false), 2000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1 bg-black text-white rounded-lg text-xs font-bold transition-all"
                    >
                      {hasCopiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{hasCopiedCode ? 'Copied' : 'Copy Script'}</span>
                    </button>
                  </div>
                  <pre className="p-4 bg-[#0A0A0D] text-gray-200 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto select-all">
                    {PINE_SCRIPT_SOURCE}
                  </pre>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-[#FAFAFC] border border-gray-200 space-y-3">
                <h4 className="font-bold text-sm text-[#0A0A0D]">Strategy Prompt & Institutional Rules</h4>
                <div className="p-4 bg-white rounded-xl border border-gray-200 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-gray-800">
                  {strategy.promptRules || strategy.description}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
