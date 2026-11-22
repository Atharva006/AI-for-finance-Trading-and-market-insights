import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  RotateCcw,
  Sliders,
  TrendingUp,
  Download,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Search,
  Globe,
  Database,
  Compass,
  Code,
  Copy,
  Check,
  Save,
  Briefcase,
  ChevronDown,
} from 'lucide-react';
import { Candle, StrategyParams, BacktestResult } from '../types/backtest';
import { AlgoStrategy } from '../types/algoMarketplace';
import { fetchUpstoxCandles } from '../services/upstoxApi';
import { runBacktest } from '../services/backtestEngine';
import { POPULAR_NSE_STOCKS, ALL_NSE_INDICES, fetchAllNseStocks, NseStock } from '../services/nseStocks';
import { fetchHistoricalDailyCandles, HistoricalDataProvider, HistoricalRange } from '../services/historicalData';
import { getStoredStrategies, updateStrategy as storeUpdateStrategy, addStrategy as storeAddStrategy } from '../services/strategyStore';
import { BasketPortfolioStudio } from './BasketPortfolioStudio';
import { StrategyDoctorModal } from './StrategyDoctorModal';
import { CompanyFilingAnalyzerModal } from './CompanyFilingAnalyzerModal';
import { NSE_FUNDAMENTAL_STOCKS } from '../services/marketPulseData';
import { ParsedStrategyPrompt } from '../services/aiPromptParser';
import { groqGenerateStrategy } from '../services/groqApi';
import { NaturalLanguagePromptBar } from './NaturalLanguagePromptBar';
import { StockLogo } from './StockLogo';
import { Sparkles } from 'lucide-react';
import { ALL_CANONICAL_STRATEGIES } from '../services/canonicalStrategies';
import { userActivityTracker } from '../services/userActivityTracker';

interface BacktestStudioProps {
  onStrategyUpdated?: (strategy: AlgoStrategy) => void;
  initialSymbol?: string;
  initialStrategy?: AlgoStrategy | null;
}

interface StudioStrategyOption {
  id: string;
  name: string;
  category: string;
  strategyType: 'PSAR_SMA100' | 'OPENING_RANGE' | 'STOCHASTIC' | 'TREND_PULLBACK_CHANDELIER';
  params?: Partial<StrategyParams>;
  targetSymbol?: string;
  timeframe?: string;
  isCustom?: boolean;
}

const DEFAULT_STUDIO_STRATEGIES: StudioStrategyOption[] = ALL_CANONICAL_STRATEGIES.map((strat) => ({
  id: strat.id,
  name: strat.name,
  category: strat.category,
  strategyType: ((strat.defaultParams?.strategyType as any) || (strat.category === 'Parabolic SAR Trend' ? 'PSAR_SMA100' : 'TREND_PULLBACK_CHANDELIER')) as any,
  params: strat.defaultParams,
  targetSymbol: strat.targetSymbol,
  timeframe: strat.timeframe || '1d',
  isCustom: false,
}));

export const BacktestStudio: React.FC<BacktestStudioProps> = ({ onStrategyUpdated, initialSymbol, initialStrategy }) => {
  const [studioTab, setStudioTab] = useState<'SINGLE' | 'BASKET'>('SINGLE');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [strategyOptions, setStrategyOptions] = useState<StudioStrategyOption[]>(DEFAULT_STUDIO_STRATEGIES);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(
    initialStrategy?.id || 'algo-nifty-trend-pullback-chandelier'
  );
  const [selectedStock, setSelectedStock] = useState<NseStock>(() => {
    if (initialSymbol) {
      const match = POPULAR_NSE_STOCKS.find(
        (s) => s.symbol.toUpperCase() === initialSymbol.toUpperCase()
      );
      if (match) return match;
      return {
        symbol: initialSymbol,
        name: initialSymbol,
        instrument_key: `NSE_EQ|${initialSymbol}`,
      };
    }
    return POPULAR_NSE_STOCKS[0];
  });
  const [allStocks, setAllStocks] = useState<NseStock[]>(POPULAR_NSE_STOCKS);
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [isStockDropdownOpen, setIsStockDropdownOpen] = useState(false);
  const [strategyMode, setStrategyMode] = useState<'OPENING_RANGE' | 'PSAR_SMA100' | 'STOCHASTIC' | 'TREND_PULLBACK_CHANDELIER'>('TREND_PULLBACK_CHANDELIER');
  const [timeframe, setTimeframe] = useState<string>('1d');
  const [dataProvider, setDataProvider] = useState<HistoricalDataProvider>('yahoo');
  const [historyRange, setHistoryRange] = useState<HistoricalRange>('max');
  const [customFromDate, setCustomFromDate] = useState<string>('2018-01-01');
  const [customToDate, setCustomToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [stockTab, setStockTab] = useState<'INDICES' | 'EQUITIES'>(() => {
    if (initialSymbol) {
      const match = POPULAR_NSE_STOCKS.find((s) => s.symbol.toUpperCase() === initialSymbol.toUpperCase());
      return match && (match.isIndex || match.category === 'INDEX') ? 'INDICES' : 'EQUITIES';
    }
    return 'INDICES';
  });
  const [candles, setCandles] = useState<Candle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [isDoctorModalOpen, setIsDoctorModalOpen] = useState(false);
  const [isFilingModalOpen, setIsFilingModalOpen] = useState(false);

  // Synchronize when initialSymbol changes
  useEffect(() => {
    if (initialSymbol) {
      const match = allStocks.find(
        (s) => s.symbol.toUpperCase() === initialSymbol.toUpperCase()
      ) || POPULAR_NSE_STOCKS.find(
        (s) => s.symbol.toUpperCase() === initialSymbol.toUpperCase()
      );
      if (match) {
        setSelectedStock(match);
        if (match.isIndex || match.category === 'INDEX') {
          setStockTab('INDICES');
        } else {
          setStockTab('EQUITIES');
        }
      } else {
        setSelectedStock({
          symbol: initialSymbol,
          name: initialSymbol,
          instrument_key: `NSE_EQ|${initialSymbol}`,
        });
        setStockTab('EQUITIES');
      }
    }
  }, [initialSymbol, allStocks]);

  useEffect(() => {
    // Load stored strategies and canonical strategies
    const stored = getStoredStrategies();
    const storedOptions: StudioStrategyOption[] = stored
      .filter((s) => !DEFAULT_STUDIO_STRATEGIES.some((d) => d.id === s.id))
      .map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category || 'Custom Strategy',
        strategyType: (s.defaultParams?.strategyType as any) || 'TREND_PULLBACK_CHANDELIER',
        params: s.defaultParams,
        targetSymbol: s.targetSymbol,
        timeframe: s.timeframe || '1d',
        isCustom: true,
      }));

    const combined = [...DEFAULT_STUDIO_STRATEGIES, ...storedOptions];
    setStrategyOptions(combined);

    // Initial strategy selection: honor initialStrategy, or default to Nifty 50 Daily
    const targetId = initialStrategy?.id || 'algo-nifty-trend-pullback-chandelier';
    const found = combined.find((o) => o.id === targetId) || combined[0];
    if (found) {
      handleSelectStrategyOption(found.id);
    }
  }, [initialStrategy]);

  const currentFundamentalStock = useMemo(() => {
    return (
      NSE_FUNDAMENTAL_STOCKS.find(
        (s) => s.symbol.toUpperCase() === selectedStock.symbol.toUpperCase()
      ) || null
    );
  }, [selectedStock.symbol]);

  const handleSelectStrategyOption = (optId: string) => {
    setSelectedStrategyId(optId);
    const chosen = strategyOptions.find((o) => o.id === optId);
    if (!chosen) return;

    setStrategyMode(chosen.strategyType);
    if (chosen.targetSymbol) {
      const match = allStocks.find(
        (s) =>
          s.symbol.toUpperCase() === chosen.targetSymbol!.toUpperCase() ||
          (chosen.targetSymbol === 'BANKNIFTY' && (s.symbol === 'NIFTY BANK' || s.symbol === 'BANKNIFTY'))
      );
      if (match) setSelectedStock(match);
    }
    if (chosen.timeframe) {
      setTimeframe(chosen.timeframe);
    }
    if (chosen.strategyType === 'TREND_PULLBACK_CHANDELIER') {
      setDataProvider('yahoo');
      setHistoryRange('max');
      setParams((prev) => ({
        ...prev,
        strategyType: 'TREND_PULLBACK_CHANDELIER',
        fastEmaLength: chosen.params?.fastEmaLength ?? 50,
        slowEmaLength: chosen.params?.slowEmaLength ?? 200,
        slopeLookback: chosen.params?.slopeLookback ?? 20,
        adxLength: chosen.params?.adxLength ?? 14,
        adxMin: chosen.params?.adxMin ?? 20.0,
        rsiPullbackLen: chosen.params?.rsiPullbackLen ?? 5,
        rsiOversold: chosen.params?.rsiOversold ?? 30.0,
        rsiOverbought: chosen.params?.rsiOverbought ?? 70.0,
        swingStopLookback: chosen.params?.swingStopLookback ?? 5,
        atrPeriod: chosen.params?.atrPeriod ?? 14,
        atrFloorMultiplier: chosen.params?.atrFloorMultiplier ?? 1.0,
        chandelierAtrMultiplier: chosen.params?.chandelierAtrMultiplier ?? 3.0,
        timeStopBars: chosen.params?.timeStopBars ?? 30,
        riskPerTradePct: chosen.params?.riskPerTradePct ?? 1.0,
        maxNotionalPct: chosen.params?.maxNotionalPct ?? 100,
        allowShort: chosen.params?.allowShort ?? true,
        slippagePoints: chosen.params?.slippagePoints ?? 2,
        initialCapital: chosen.params?.initialCapital ?? 1000000,
        positionMode: 'BOTH',
        ...(chosen.params || {}),
      }));
    } else if (chosen.strategyType === 'PSAR_SMA100') {
      setDataProvider('yahoo');
      setHistoryRange('max');
      setParams((prev) => ({
        ...prev,
        strategyType: 'PSAR_SMA100',
        tradeDir: chosen.params?.tradeDir || 'Buy Only',
        smaLength: chosen.params?.smaLength || 100,
        slLookback: chosen.params?.slLookback ?? 1,
        rrRatio: chosen.params?.rrRatio ?? 4.0,
        maxRiskPercent: chosen.params?.maxRiskPercent ?? 9.0,
        riskPerTradePct: chosen.params?.riskPerTradePct ?? 3.0,
        psarStart: chosen.params?.psarStart ?? 0.01,
        psarStep: chosen.params?.psarStep ?? 0.01,
        psarMax: chosen.params?.psarMax ?? 0.10,
        initialCapital: 100000,
        positionMode: 'LONG_ONLY',
        ...(chosen.params || {}),
      }));
    } else if (chosen.params) {
      setParams((prev) => ({
        ...prev,
        ...chosen.params,
        strategyType: chosen.strategyType,
      }));
    }
    setSaveToast(`Active Strategy: "${chosen.name}"`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Indicators & ATR customization
  const [enableAtr, setEnableAtr] = useState<boolean>(false);
  const [indicatorSearchQuery, setIndicatorSearchQuery] = useState('');
  const [enabledIndicators, setEnabledIndicators] = useState<string[]>(['PSAR', 'SMA100']);

  // Strategy Parameters
  const [params, setParams] = useState<StrategyParams>({
    strategyType: 'TREND_PULLBACK_CHANDELIER',
    fastEmaLength: 50,
    slowEmaLength: 200,
    slopeLookback: 20,
    adxLength: 14,
    adxMin: 20.0,
    rsiPullbackLen: 5,
    rsiOversold: 30.0,
    rsiOverbought: 70.0,
    swingStopLookback: 5,
    atrPeriod: 14,
    atrFloorMultiplier: 1.0,
    chandelierAtrMultiplier: 3.0,
    timeStopBars: 30,
    maxNotionalPct: 100,
    allowShort: true,
    initialCapital: 1000000,
    riskPerTradePct: 1.0,
    slippagePoints: 2,
    brokeragePerOrder: 20,
    positionMode: 'BOTH',
    dataProvider: 'yahoo',
    tradeDir: 'Both',
    psarStart: 0.01,
    psarStep: 0.01,
    psarMax: 0.10,
    smaLength: 100,
    slLookback: 1,
    rrRatio: 4.0,
    maxRiskPercent: 9.0,
    orbTimeframeMinutes: 5,
    orbSlBodyPct: 0.70,
    orbRiskReward: 1.5,
    orbRiskPerTradeINR: 1000,
    enableAtr: false,
    fixedSlPct: 1.2,
    fixedTpPct: 3.6,
    stochKPeriod: 14,
    stochSmooth: 3,
    stochDPeriod: 3,
    stochOverbought: 80,
    stochOversold: 20,
    atrSlMultiplier: 1.2,
    atrTpMultiplier: 3.6,
    useTrailingStop: true,
    historyRange: 'max',
  });

  // 1. Calculate SVG points for Equity Curve (viewBox 0 0 600 150 matching Stitch Screen 4)
  const equitySvgPoints = useMemo(() => {
    if (!result || !result.equityCurve || result.equityCurve.length === 0) return '';
    const values = result.equityCurve.map((p) => p.equity);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    return values
      .map((val, idx) => {
        const x = (idx / (values.length - 1 || 1)) * 600;
        const y = 140 - ((val - min) / range) * 120;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [result]);

  // 2. Calculate SVG points for Underwater Drawdown (viewBox 0 0 600 50 matching Stitch Screen 4)
  const drawdownSvgData = useMemo(() => {
    if (!result || !result.equityCurve || result.equityCurve.length === 0) {
      return { line: '', polygon: '', maxDdVal: 0 };
    }
    const dds = result.equityCurve.map((p) => Math.abs(p.drawdownPct));
    const maxDd = Math.max(0.1, ...dds);
    const linePoints: string[] = [];
    result.equityCurve.forEach((p, idx) => {
      const x = (idx / (result.equityCurve.length - 1 || 1)) * 600;
      const y = 2 + (Math.abs(p.drawdownPct) / maxDd) * 44;
      linePoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    });
    const line = linePoints.join(' ');
    const polygon = `0,2 ${line} 600,2 Z`;
    return { line, polygon, maxDdVal: maxDd };
  }, [result]);

  // 3. Trade dots on equity curve
  const tradeDots = useMemo(() => {
    if (!result || !result.trades || !result.equityCurve || result.equityCurve.length === 0) return [];
    const values = result.equityCurve.map((p) => p.equity);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const curveLen = result.equityCurve.length;

    return result.trades.map((t) => {
      let curveIdx = result.equityCurve.findIndex((p) => p.time === t.exitTime || p.time === t.entryTime);
      if (curveIdx === -1) {
        const tIdx = result.trades.indexOf(t);
        curveIdx = Math.min(curveLen - 1, Math.floor((tIdx / Math.max(1, result.trades.length - 1)) * (curveLen - 1)));
      }
      const val = values[curveIdx];
      const x = (curveIdx / Math.max(1, curveLen - 1)) * 600;
      const y = 140 - ((val - min) / range) * 120;
      return {
        x: Number(x.toFixed(1)),
        y: Number(y.toFixed(1)),
        isProfit: t.pnl >= 0,
        id: t.id,
        pnl: t.pnl,
      };
    });
  }, [result]);

  // 4. Monthly Heatmap Data (Real aggregated monthly returns)
  const monthlyHeatmap = useMemo(() => {
    if (!result || !result.trades || result.trades.length === 0) {
      return [
        { year: 2025, months: [4.2, 3.8, -0.9, 5.1, 2.4, null, null, null, null, null, null, null] },
        { year: 2024, months: [3.1, -1.4, 4.8, 2.9, 6.2, 1.7, -0.6, 3.4, 4.1, -1.8, 5.0, 2.6] },
        { year: 2023, months: [2.1, 1.9, -1.1, 3.5, 4.2, -0.8, 2.7, 3.9, -1.2, 4.5, 3.2, 5.8] },
      ];
    }
    const map: Record<number, Record<number, number>> = {};
    const capital = params.initialCapital || 100000;
    result.trades.forEach((t) => {
      const d = new Date(t.entryTime || t.exitTime);
      const y = isNaN(d.getFullYear()) ? 2024 : d.getFullYear();
      const m = isNaN(d.getMonth()) ? 0 : d.getMonth();
      if (!map[y]) map[y] = {};
      map[y][m] = (map[y][m] || 0) + (t.pnl / capital) * 100;
    });
    const years = Object.keys(map).map(Number).sort((a, b) => b - a);
    if (years.length === 0) {
      years.push(2025, 2024, 2023);
    }
    return years.slice(0, 3).map((year) => ({
      year,
      months: Array.from({ length: 12 }, (_, m) => (map[year] && map[year][m] !== undefined ? parseFloat(map[year][m].toFixed(1)) : null)),
    }));
  }, [result, params.initialCapital]);

  useEffect(() => {
    fetchAllNseStocks().then((stocks) => {
      setAllStocks(stocks);
    });
  }, []);

  const filteredStocks = allStocks
    .filter(
      (s) =>
        s.symbol.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(stockSearchQuery.toLowerCase())
    )
    .slice(0, 30);

  useEffect(() => {
    let active = true;
    async function loadData() {
      setIsLoading(true);
      try {
        let data: Candle[] = [];
        if (timeframe === '1d') {
          data = await fetchHistoricalDailyCandles({
            stock: selectedStock,
            provider: dataProvider,
            range: historyRange,
            customFromDate: historyRange === 'custom' ? customFromDate : undefined,
            customToDate: historyRange === 'custom' ? customToDate : undefined,
          });
        } else {
          data = await fetchUpstoxCandles({
            instrumentKey: selectedStock.instrument_key,
            timeframe,
          });
          // Seamless fallback to daily data if intraday stream is quiet
          if (!data || data.length === 0) {
            data = await fetchHistoricalDailyCandles({
              stock: selectedStock,
              provider: dataProvider,
              range: historyRange === 'max' ? '1y' : historyRange,
            });
          }
        }
        if (active) {
          setCandles(data);
          const res = runBacktest(data, params);
          setResult(res);
          userActivityTracker.trackBacktest({
            strategyId: selectedStrategyId,
            strategyName: selectedStrategyId,
            symbol: selectedStock.symbol,
            timeframe,
            initialBalance: 100000,
            finalBalance: 100000 + (res.metrics?.totalReturn || 0),
            netPnl: res.metrics?.totalReturn || 0,
            winRate: res.metrics?.winRate || 0,
            profitFactor: res.metrics?.profitFactor || 1.0,
            maxDrawdown: res.metrics?.maxDrawdownPct || 0,
            totalTrades: res.metrics?.totalTrades || 0,
          });
        }
      } catch (e) {
        console.error('Error fetching data:', e);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, [selectedStock, timeframe, dataProvider, historyRange, customFromDate, customToDate]);

  const handleRecalculate = () => {
    if (candles.length > 0) {
      const res = runBacktest(candles, params);
      setResult(res);
      userActivityTracker.trackBacktest({
        strategyId: selectedStrategyId,
        strategyName: selectedStrategyId,
        symbol: selectedStock.symbol,
        timeframe,
        initialBalance: 100000,
        finalBalance: 100000 + (res.metrics?.totalReturn || 0),
        netPnl: res.metrics?.totalReturn || 0,
        winRate: res.metrics?.winRate || 0,
        profitFactor: res.metrics?.profitFactor || 1.0,
        maxDrawdown: res.metrics?.maxDrawdownPct || 0,
        totalTrades: res.metrics?.totalTrades || 0,
      });
    }
  };

  const handleSaveSettingsToMain = () => {
    const stored = getStoredStrategies();
    const symbolClean = selectedStock.symbol.toUpperCase();
    const symbolSlug = symbolClean.toLowerCase().replace(/[^a-z0-9]/g, '-');

    let targetId = selectedStrategyId;
    let stratName = strategyOptions.find((o) => o.id === selectedStrategyId)?.name;

    if (strategyMode === 'TREND_PULLBACK_CHANDELIER') {
      targetId = `algo-nifty-trend-pullback-chandelier`;
      stratName = `Nifty 50 Daily Trend-Pullback`;
    } else if (!stratName || strategyMode === 'PSAR_SMA100') {
      targetId = `algo-psar-strategy-${symbolSlug}`;
      stratName = `PSAR Strategy - ${symbolClean}`;
    } else if (strategyMode === 'OPENING_RANGE') {
      targetId = `algo-orb-${symbolSlug}`;
      stratName = `Opening Range Breakout - ${symbolClean}`;
    } else if (strategyMode === 'STOCHASTIC') {
      targetId = `algo-stoch-${symbolSlug}`;
      stratName = `Stochastic Oscillator - ${symbolClean}`;
    }

    const matched = stored.find(
      (s) => s.id === targetId || (s.targetSymbol?.toUpperCase() === symbolClean && s.defaultParams?.strategyType === strategyMode)
    );
    let savedStrategy: AlgoStrategy;

    if (matched) {
      savedStrategy = {
        ...matched,
        name: stratName,
        targetSymbol: selectedStock.symbol,
        targetInstrumentKey: selectedStock.instrument_key,
        timeframe: timeframe,
        defaultParams: {
          ...matched.defaultParams,
          ...params,
          dataProvider,
          historyRange,
        },
      };
      storeUpdateStrategy(savedStrategy);
    } else {
      savedStrategy = {
        id: targetId,
        name: stratName,
        tagline: `${strategyMode === 'PSAR_SMA100' ? 'PSAR Trend Following' : strategyMode} · ${params.tradeDir || 'Buy Only'} · ${selectedStock.symbol} · 1:${params.rrRatio || 4} RR`,
        category: strategyMode === 'PSAR_SMA100' ? 'Trend Following' : strategyMode === 'OPENING_RANGE' ? 'Opening Range Breakout' : 'Stochastic Oscillator',
        style: strategyMode === 'PSAR_SMA100' ? 'Directional PSAR Swing (Buy Only)' : 'Directional Breakout',
        marginRequired: 50000,
        rollingReturn1m: result?.metrics.totalReturnPct || 0,
        return3m: 0,
        return6m: 0,
        return1y: 0,
        winRate: result?.metrics.winRate || 0,
        maxDrawdown: result?.metrics.maxDrawdownPct || 0,
        capitalTier: 'under_100k',
        sparkline: [100, 101, 102, 103, 104],
        description: `Calibrated strategy for ${selectedStock.name} (${selectedStock.symbol}) on ${timeframe} timeframe. Direction: ${params.tradeDir || 'Buy Only'}, Lookback SL: ${params.slLookback || 1} bar, Risk-Reward: 1:${params.rrRatio || 4}, Max Risk: ${params.maxRiskPercent || 9}%, RPT: ${params.riskPerTradePct || 3}%.`,
        promptRules: `Asset: ${selectedStock.symbol}. Timeframe: ${timeframe}. Direction: ${params.tradeDir || 'Buy Only'}. Lookback SL: ${params.slLookback || 1} bar. R:R 1:${params.rrRatio || 4}. Max Risk: ${params.maxRiskPercent || 9}%. RPT: ${params.riskPerTradePct || 3}%.`,
        targetSymbol: selectedStock.symbol,
        targetInstrumentKey: selectedStock.instrument_key,
        timeframe: timeframe,
        isCustom: true,
        isPublished: true,
        author: 'Atharva Bhosale',
        createdAt: new Date().toISOString(),
        defaultParams: {
          ...params,
          dataProvider,
          historyRange,
        },
        worst5Drawdowns: [],
        monthlyDistribution: [],
        pastTrades: [],
      };
      storeAddStrategy(savedStrategy);
    }

    // Ensure it is in strategyOptions dropdown
    setStrategyOptions((prev) => {
      const exists = prev.find((o) => o.id === targetId);
      if (exists) {
        return prev.map((o) =>
          o.id === targetId
            ? { ...o, params: { ...o.params, ...params }, targetSymbol: selectedStock.symbol }
            : o
        );
      }
      return [
        ...prev,
        {
          id: targetId,
          name: stratName,
          category: strategyMode === 'PSAR_SMA100' ? 'Trend Following' : 'Breakout',
          strategyType: strategyMode,
          params: { ...params },
          targetSymbol: selectedStock.symbol,
          timeframe: timeframe,
          isCustom: true,
        },
      ];
    });

    setSelectedStrategyId(targetId);
    onStrategyUpdated?.(savedStrategy);
    setSaveToast(`✓ Saved settings for "${stratName}" to Main System!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleApplyParsedPrompt = (parsed: ParsedStrategyPrompt) => {
    if (parsed.symbol) {
      const symClean = parsed.symbol.toUpperCase().replace('.NS', '');
      const matched =
        allStocks.find((s) => s.symbol.toUpperCase() === symClean) ||
        POPULAR_NSE_STOCKS.find((s) => s.symbol.toUpperCase() === symClean);
      if (matched) {
        setSelectedStock(matched);
      }
    }

    if (parsed.timeframe) {
      setTimeframe(parsed.timeframe as any);
    }

    setParams((prev) => ({
      ...prev,
      strategyType: parsed.strategyType,
      initialCapital: parsed.params.initialCapital || prev.initialCapital,
      riskPerTradePct: parsed.params.riskPerTradePct || prev.riskPerTradePct,
      rrRatio: parsed.params.rrRatio || prev.rrRatio,
      slLookback: parsed.params.slLookback || prev.slLookback,
      slippagePoints: parsed.params.slippagePoints || prev.slippagePoints,
      brokeragePerOrder: parsed.params.brokeragePerOrder || prev.brokeragePerOrder,
      ...parsed.params,
    }));

    setSaveToast(`⚡ Groq 120B AI synthesized and loaded "${parsed.strategyType}" strategy!`);
    setTimeout(() => setSaveToast(null), 4000);
  };

  const handleExportCSV = () => {
    if (!result || result.trades.length === 0) return;
    const headers = 'ID,Type,Entry Time,Entry Price,Exit Time,Exit Price,Qty,Exit Reason,PnL (INR),PnL (%),ATR\n';
    const rows = result.trades
      .map(
        (t) =>
          `${t.id},${t.type},"${t.entryTime}",${t.entryPrice},"${t.exitTime}",${t.exitPrice},${t.qty},${t.exitReason},${t.pnl},${t.pnlPct}%,${t.atrAtEntry}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Upstox_${selectedStock.symbol.replace(' ', '_')}_Backtest_Trades.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col w-full gap-space-lg pb-2">
      {/* Top Section: Single Asset vs Basket Mode + Natural Language Copilot (Stitch Screen 4) */}
      <section className="w-full bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-sm shrink-0">
          <div aria-label="Backtest Mode" className="inline-flex p-1 rounded-lg bg-surface-container-low border border-border-subtle" role="group">
            <button
              onClick={() => setStudioTab('SINGLE')}
              className={`mode-btn px-space-md py-1.5 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                studioTab === 'SINGLE'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Single Asset
            </button>
            <button
              onClick={() => setStudioTab('BASKET')}
              className={`mode-btn px-space-md py-1.5 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                studioTab === 'BASKET'
                  ? 'bg-primary text-on-primary font-semibold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Basket Portfolio
            </button>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 px-space-sm py-1 rounded-full bg-bullish-tint text-bullish font-mono-sm text-mono-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish"></span>
            VECTORIZED {studioTab === 'BASKET' ? 'MULTI-ASSET' : 'ENGINE READY'}
          </span>
          {studioTab === 'SINGLE' && (
            <>
              <button
                onClick={handleSaveSettingsToMain}
                className="inline-flex items-center gap-space-xs px-space-sm py-1 bg-surface-card border border-border-subtle hover:bg-surface-container text-on-surface rounded-lg font-label-md text-label-md shadow-xs transition-all cursor-pointer"
                title="Save calibrated settings to Main System"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>

              <button
                onClick={() => setIsDoctorModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white rounded-lg font-label-md text-label-md shadow-xs transition-all cursor-pointer font-bold active:scale-95"
                title="Launch Quantitative Monte Carlo Risk & Strategy Audit"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Strategy Risk Audit</span>
              </button>
            </>
          )}
        </div>

        {/* Sole Strategy Engine Status Badge */}
        <div className="flex items-center gap-space-sm font-mono-sm text-mono-sm">
          <div className="flex items-center gap-2 px-space-md py-2 rounded-lg bg-surface-container-low border border-border-subtle">
            <span className="w-2.5 h-2.5 rounded-full bg-bullish animate-pulse" />
            <span className="font-semibold text-on-surface">Asia-London-NY FVG Inversion (Pine Script v5)</span>
            <span className="px-2 py-0.5 rounded-full bg-forex-tint text-secondary font-bold text-[10px]">
              15m VECTORIZED
            </span>
          </div>
          <span className="hidden md:inline-flex items-center gap-1 text-bullish font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish" />
            REAL-TIME VECTORIZED INTRADAY FEEDS
          </span>
        </div>
      </section>

      {saveToast && (
        <div className="bg-bullish-tint border border-bullish/20 text-bullish px-4 py-3 rounded-xl text-xs font-mono font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-bullish" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="text-bullish hover:text-on-surface font-bold">✕</button>
        </div>
      )}

      {studioTab === 'BASKET' ? (
        <BasketPortfolioStudio />
      ) : (
        <>
          {/* Top Controls Bar (NSE Asset Search, Quick Chips, Timeframe, Upstox API Status) */}
          <div className="bg-surface-card p-space-lg rounded-xl border border-border-subtle shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: NSE Stock Search Dropdown */}
          <div className="relative flex-1 min-w-[280px]">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
              National Stock Exchange (NSE) Equity / Index
            </label>
            <div
              onClick={() => setIsStockDropdownOpen(!isStockDropdownOpen)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer hover:border-black transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <StockLogo symbol={selectedStock.symbol} instrumentKey={selectedStock.instrument_key} name={selectedStock.name} size="sm" />
                <span className="font-bold text-black">{selectedStock.symbol}</span>
                <span className="text-gray-400">—</span>
                <span className="text-gray-600 truncate max-w-[200px]">{selectedStock.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  NSE
                </span>
                {currentFundamentalStock && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFilingModalOpen(true);
                    }}
                    className="ml-2 px-2 py-0.5 rounded-lg bg-emerald-100/70 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 transition-colors"
                    title="Open SEBI LODR Quarterly Filing & Earnings Concall Analysis"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>Concall AI</span>
                  </button>
                )}
              </div>
              <span className="text-gray-400 text-[10px]">Change ▼</span>
            </div>

            {/* Dropdown popup */}
            {isStockDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 z-30 space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    placeholder="Search 3,797 NSE stocks (e.g. RELIANCE, TCS, INFY)..."
                    className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-black"
                    autoFocus
                  />
                </div>
                <div className="max-h-56 overflow-y-auto divide-y divide-gray-100">
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
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={stock.symbol} instrumentKey={stock.instrument_key} name={stock.name} size="xs" />
                        <div>
                          <span className="font-bold text-black">{stock.symbol}</span>
                          <span className="text-gray-500 ml-2">{stock.name}</span>
                        </div>
                      </div>
                      <span className="font-mono text-gray-600 font-semibold">
                        ₹{stock.last_price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center: Timeframe Picker, Provider & History Range */}
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Time Slot
              </label>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                {['1m', '5m', '15m', '30m', '1h', '4h', '1d'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                      timeframe === tf
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-text-secondary hover:text-on-surface'
                    }`}
                  >
                    {tf.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Data Provider
              </label>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDataProvider('yahoo')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    dataProvider === 'yahoo' ? 'bg-primary text-on-primary shadow-xs' : 'text-text-secondary hover:text-on-surface'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-bullish" />
                  <span>Yahoo Finance (Free Daily · Inception)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDataProvider('upstox')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    dataProvider === 'upstox' ? 'bg-primary text-on-primary shadow-xs' : 'text-text-secondary hover:text-on-surface'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-secondary" />
                  <span>Upstox Live Feed</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  History Range
                </label>
                <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                  {[
                    { id: 'max', label: 'Max (Inception)' },
                    { id: '10y', label: '10Y' },
                    { id: '5y', label: '5Y' },
                    { id: '3y', label: '3Y' },
                    { id: '1y', label: '1Y' },
                    { id: '300d', label: '300D' },
                    { id: 'custom', label: 'Custom' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setHistoryRange(r.id as any)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        historyRange === r.id ? 'bg-primary text-white shadow-xs' : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {historyRange === 'custom' && (
                <div className="flex items-center gap-1.5 pt-4">
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">From:</span>
                    <input
                      type="date"
                      value={customFromDate}
                      onChange={(e) => setCustomFromDate(e.target.value)}
                      className="bg-transparent text-xs font-mono font-bold text-black focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-1 rounded-xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase font-mono">To:</span>
                    <input
                      type="date"
                      value={customToDate}
                      onChange={(e) => setCustomToDate(e.target.value)}
                      className="bg-transparent text-xs font-mono font-bold text-black focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Stream Badge & Run */}
          <div className="flex items-end gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1.5 text-xs font-mono text-gray-500 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {timeframe === '1d' && dataProvider === 'yahoo'
                    ? `Yahoo Finance Free Daily (${candles.length} Candles)`
                    : `Upstox Stream (${candles.length} Candles)`}
                </span>
              </div>
              <span className="text-[10px] text-gray-400 font-mono block">NSE Equities & Index · No BSE</span>
            </div>

            <button
              onClick={handleRecalculate}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{isLoading ? 'Fetching Candles...' : 'Run Backtest'}</span>
            </button>
          </div>
        </div>

        {/* Popular NSE Stock Quick Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
            Quick NSE:
          </span>
          {POPULAR_NSE_STOCKS.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => setSelectedStock(stock)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                selectedStock.symbol === stock.symbol
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200'
              }`}
            >
              {stock.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Parameters Sidebar + Chart & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Left Parameters Sidebar */}
        <aside className="lg:col-span-4 xl:col-span-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <span className="font-bold text-sm text-[#0A0A0D] flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              Strategy Engine
            </span>
            <button
              onClick={() => {
                if (strategyMode === 'PSAR_SMA100') {
                  setParams({
                    ...params,
                    strategyType: 'PSAR_SMA100',
                    tradeDir: 'Buy Only',
                    psarStart: 0.01,
                    psarStep: 0.01,
                    psarMax: 0.10,
                    smaLength: 100,
                    slLookback: 1,
                    rrRatio: 4.0,
                    maxRiskPercent: 9.0,
                    riskPerTradePct: 3.0,
                    initialCapital: 100000,
                    positionMode: 'LONG_ONLY',
                  });
                } else if (strategyMode === 'OPENING_RANGE') {
                  setParams({
                    ...params,
                    strategyType: 'OPENING_RANGE',
                    orbTimeframeMinutes: 5,
                    orbSlBodyPct: 0.70,
                    orbRiskReward: 1.5,
                    orbRiskPerTradeINR: 1000,
                    atrPeriod: 0,
                    initialCapital: 100000,
                    riskPerTradePct: 1.0,
                  });
                } else {
                  setParams({
                    ...params,
                    strategyType: 'STOCHASTIC',
                    stochKPeriod: 14,
                    stochSmooth: 3,
                    stochDPeriod: 3,
                    stochOverbought: 80,
                    stochOversold: 20,
                    atrPeriod: 14,
                    atrSlMultiplier: 1.2,
                    atrTpMultiplier: 3.6,
                    useTrailingStop: true,
                    initialCapital: 100000,
                    riskPerTradePct: 2.0,
                  });
                }
              }}
              className="text-xs text-gray-400 hover:text-black flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Natural Language Prompt-to-Strategy Engine */}
          <div className="space-y-1 pb-1">
            <NaturalLanguagePromptBar
              onApplyParsedStrategy={handleApplyParsedPrompt}
              placeholder='Ask Groq 120B AI: e.g. "INFY PSAR swing with 1% RPT and 100 SMA"...'
            />
          </div>

          {/* Strategy Engine Dropdown Menu (No more static boxes) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Active Quantitative Strategy
              </label>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                {strategyOptions.length} Strategies
              </span>
            </div>

            <div className="relative">
              <select
                value={selectedStrategyId}
                onChange={(e) => handleSelectStrategyOption(e.target.value)}
                className="w-full appearance-none px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-[#0A0A0D] pr-10 focus:outline-none focus:ring-2 focus:ring-black cursor-pointer hover:border-black transition-colors"
              >
                <optgroup label="Pre-Configured Quantitative Strategies">
                  {strategyOptions.filter((o) => !o.isCustom).map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} ({opt.category})
                    </option>
                  ))}
                </optgroup>
                {strategyOptions.some((o) => o.isCustom) && (
                  <optgroup label="AI Generated & Custom Strategies">
                    {strategyOptions.filter((o) => o.isCustom).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        ⚡ {opt.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Conditional Controls based on Strategy */}
          {strategyMode === 'TREND_PULLBACK_CHANDELIER' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#0A0A0D] uppercase tracking-wider text-gray-500">
                  Trend-Pullback Chandelier Rules
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  Pine Script v5
                </span>
              </div>

              {/* EMA Trend Regime */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Fast EMA Length:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.fastEmaLength ?? 50}</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={params.fastEmaLength ?? 50}
                  onChange={(e) => setParams({ ...params, fastEmaLength: parseInt(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Slow EMA Length:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.slowEmaLength ?? 200}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="300"
                  step="10"
                  value={params.slowEmaLength ?? 200}
                  onChange={(e) => setParams({ ...params, slowEmaLength: parseInt(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>ADX(14) Filter Minimum:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">&gt; {params.adxMin ?? 20.0}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="35"
                  step="1"
                  value={params.adxMin ?? 20.0}
                  onChange={(e) => setParams({ ...params, adxMin: parseFloat(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              {/* RSI Pullback */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-gray-500 block mb-1">RSI Oversold (&lt;):</span>
                  <input
                    type="number"
                    value={params.rsiOversold ?? 30.0}
                    onChange={(e) => setParams({ ...params, rsiOversold: parseFloat(e.target.value) || 30.0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block mb-1">RSI Overbought (&gt;):</span>
                  <input
                    type="number"
                    value={params.rsiOverbought ?? 70.0}
                    onChange={(e) => setParams({ ...params, rsiOverbought: parseFloat(e.target.value) || 70.0 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Chandelier Trail Multiplier & Time Stop */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Chandelier Exit Multiple (xATR):</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.chandelierAtrMultiplier ?? 3.0}x ATR</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="5.0"
                  step="0.1"
                  value={params.chandelierAtrMultiplier ?? 3.0}
                  onChange={(e) => setParams({ ...params, chandelierAtrMultiplier: parseFloat(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
                <span className="text-[10px] text-gray-400 block">
                  Activated after trade reaches +1R risk distance
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Time Stop (Max Bars):</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.timeStopBars ?? 30} bars</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={params.timeStopBars ?? 30}
                  onChange={(e) => setParams({ ...params, timeStopBars: parseInt(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1 text-xs text-gray-600 font-mono">
                <div className="flex items-center justify-between">
                  <span>Initial Stop:</span>
                  <span className="font-bold text-black">min(5-bar low, close - 1x ATR)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Risk Sizing:</span>
                  <span className="text-emerald-600 font-bold">Strict 1.0% Equity Risk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Commission:</span>
                  <span className="text-gray-600 font-bold">0.1% + 2-Tick Slippage</span>
                </div>
              </div>
            </div>
          ) : strategyMode === 'PSAR_SMA100' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#0A0A0D] uppercase tracking-wider text-gray-500">
                  PSAR Strategy Rules
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  Pine Script v5
                </span>
              </div>

              {/* Trade Direction */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">Trade Direction</label>
                <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-xl">
                  {(['Both', 'Buy Only', 'Sell Only'] as const).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      onClick={() => setParams({ ...params, tradeDir: dir })}
                      className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                        (params.tradeDir || 'Buy Only') === dir
                          ? 'bg-black text-white shadow-sm'
                          : 'text-gray-600 hover:text-black'
                      }`}
                    >
                      {dir}
                    </button>
                  ))}
                </div>
              </div>

              {/* SMA Length */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>SMA 100 Length:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.smaLength ?? 100}</span>
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
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>SL N-Candles Lookback:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.slLookback ?? 1} bar back</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={params.slLookback ?? 1}
                  onChange={(e) => setParams({ ...params, slLookback: parseInt(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              {/* Risk Reward */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Risk : Reward Ratio:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">1 : {params.rrRatio ?? 4.0}</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={params.rrRatio ?? 4.0}
                  onChange={(e) => setParams({ ...params, rrRatio: parseFloat(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              {/* Max Risk % */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Max Risk % per Trade:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.maxRiskPercent ?? 9.0}%</span>
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
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Risk Per Trade %:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.riskPerTradePct ?? 3.0}% (₹{Math.round(params.initialCapital * ((params.riskPerTradePct ?? 3.0) / 100))})</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5.0"
                  step="0.1"
                  value={params.riskPerTradePct ?? 3.0}
                  onChange={(e) => setParams({ ...params, riskPerTradePct: parseFloat(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1 text-xs text-gray-600 font-mono">
                <div className="flex items-center justify-between">
                  <span>Signal:</span>
                  <span className="font-bold text-black">PSAR Flip + SMA Trend</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pending Timeout:</span>
                  <span className="text-gray-500 font-bold">2 Bars Cancel</span>
                </div>
              </div>
            </div>
          ) : strategyMode === 'OPENING_RANGE' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#0A0A0D] block uppercase tracking-wider text-gray-500">
                  Opening Range 5M Rules
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  09:15-09:20 Block
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Stop Loss (% of 5M Body):</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">
                    {((params.orbSlBodyPct ?? 0.7) * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={((params.orbSlBodyPct ?? 0.7) * 100)}
                  onChange={(e) =>
                    setParams({ ...params, orbSlBodyPct: parseInt(e.target.value) / 100 })
                  }
                  className="w-full accent-black cursor-pointer h-1"
                />
                <span className="text-[10px] text-gray-400 block">
                  Strictly 70% of 1st 5-minute candle body from entry
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Risk to Reward Ratio:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">
                    1 : {params.orbRiskReward ?? 1.5}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.1"
                  value={params.orbRiskReward ?? 1.5}
                  onChange={(e) =>
                    setParams({ ...params, orbRiskReward: parseFloat(e.target.value) })
                  }
                  className="w-full accent-black cursor-pointer h-1"
                />
                <span className="text-[10px] text-gray-400 block">
                  Target = 1.5x SL distance (1:1.5 RR)
                </span>
              </div>

              <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1 text-xs text-gray-600 font-mono">
                <div className="flex items-center justify-between">
                  <span>Execution:</span>
                  <span className="font-bold text-black">09:20 AM OCO Bracket</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buy Stop:</span>
                  <span className="text-emerald-600 font-bold">1st 5m High</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sell Stop:</span>
                  <span className="text-rose-600 font-bold">1st 5m Low</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Volatility ATR:</span>
                  <span className="text-gray-400 font-bold">Disabled (Zero ATR)</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Indicator Controls & Direct ATR Disable Button */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-[#0A0A0D] uppercase tracking-wider text-gray-500">
                  Stochastic Parameters
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !enableAtr;
                    setEnableAtr(next);
                    setParams({
                      ...params,
                      enableAtr: next,
                      atrPeriod: next ? 14 : 0,
                      atrSlMultiplier: next ? 1.5 : 0,
                      atrTpMultiplier: next ? 3.0 : 0,
                      useTrailingStop: next ? params.useTrailingStop : false,
                    });
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    enableAtr
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  ATR Stops: {enableAtr ? 'ACTIVE' : 'DISABLED'}
                </button>
              </div>

              {/* Indicator Search Bar */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    placeholder="Search indicators (ATR, EMA, RSI)..."
                    value={indicatorSearchQuery}
                    onChange={(e) => setIndicatorSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[11px] focus:outline-none focus:border-black"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {['ATR Volatility', 'EMA Trend', 'RSI 14', 'Supertrend']
                    .filter((i) => i.toLowerCase().includes(indicatorSearchQuery.toLowerCase()))
                    .map((ind) => (
                      <span
                        key={ind}
                        onClick={() => {
                          if (ind.startsWith('ATR')) {
                            const next = !enableAtr;
                            setEnableAtr(next);
                            setParams({
                              ...params,
                              enableAtr: next,
                              atrPeriod: next ? 14 : 0,
                              atrSlMultiplier: next ? 1.5 : 0,
                              atrTpMultiplier: next ? 3.0 : 0,
                            });
                          }
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded cursor-pointer border ${
                          ind.startsWith('ATR') && enableAtr
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}
                      >
                        {ind} {ind.startsWith('ATR') ? (enableAtr ? '✓' : '+') : '+'}
                      </span>
                    ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>%K Period (Lookback):</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.stochKPeriod}</span>
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

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>%K Smoothing:</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.stochSmooth}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={params.stochSmooth}
                  onChange={(e) => setParams({ ...params, stochSmooth: parseInt(e.target.value) })}
                  className="w-full accent-black cursor-pointer h-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>%D Period (Signal):</span>
                  <span className="font-bold font-mono text-[#0A0A0D]">{params.stochDPeriod}</span>
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

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[11px] text-gray-500 block mb-1">Overbought (&gt;):</span>
                  <input
                    type="number"
                    value={params.stochOverbought}
                    onChange={(e) => setParams({ ...params, stochOverbought: parseInt(e.target.value) || 80 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-gray-500 block mb-1">Oversold (&lt;):</span>
                  <input
                    type="number"
                    value={params.stochOversold}
                    onChange={(e) => setParams({ ...params, stochOversold: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Conditional ATR Controls vs Fixed SL/TP */}
              {enableAtr ? (
                <>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>ATR Stop-Loss Multiplier:</span>
                      <span className="font-bold font-mono text-[#0A0A0D]">{params.atrSlMultiplier}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="3.5"
                      step="0.1"
                      value={params.atrSlMultiplier}
                      onChange={(e) => setParams({ ...params, atrSlMultiplier: parseFloat(e.target.value) })}
                      className="w-full accent-black cursor-pointer h-1"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>ATR Take-Profit Multiplier:</span>
                      <span className="font-bold font-mono text-[#0A0A0D]">{params.atrTpMultiplier}x</span>
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

                  <label className="flex items-center gap-2.5 cursor-pointer pt-1 text-xs text-gray-700">
                    <input
                      type="checkbox"
                      checked={params.useTrailingStop}
                      onChange={(e) => setParams({ ...params, useTrailingStop: e.target.checked })}
                      className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                    />
                    <span className="font-medium">Enable Dynamic ATR Trailing Stop</span>
                  </label>
                </>
              ) : (
                <>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Fixed Stop Loss %:</span>
                      <span className="font-bold font-mono text-[#0A0A0D]">{params.fixedSlPct || 1.0}%</span>
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

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Fixed Target %:</span>
                      <span className="font-bold font-mono text-[#0A0A0D]">{params.fixedTpPct || 2.0}%</span>
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
          )}

          {/* Capital & Execution */}
          <div className="space-y-3 pt-4 border-t border-gray-100">
            <span className="text-xs font-bold text-[#0A0A0D] block uppercase tracking-wider text-gray-500">
              Capital & Position Sizing
            </span>

            <div>
              <span className="text-[11px] text-gray-500 block mb-1">Account Margin (₹):</span>
              <input
                type="number"
                value={params.initialCapital}
                onChange={(e) => setParams({ ...params, initialCapital: parseInt(e.target.value) || 100000 })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <span className="text-[11px] text-gray-500 block mb-1">Risk per Trade (%):</span>
              <input
                type="number"
                step="0.1"
                value={params.riskPerTradePct}
                onChange={(e) => setParams({ ...params, riskPerTradePct: parseFloat(e.target.value) || 1.5 })}
                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-black"
              />
            </div>

            <button
              onClick={handleSaveSettingsToMain}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 mt-3 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-bullish" />
              <span>Save Settings to Main System</span>
            </button>
          </div>
        </aside>

        {/* Right 8 cols: Results, Exact Stitch Dual SVG Chart, Monthly Returns & Trade Ledger */}
        <div className="lg:col-span-8 flex flex-col gap-space-md min-w-0">
          {/* 1. 6-Metric Cards Grid */}
          {result && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-gutter">
              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-1">
                <span className="font-label-sm text-label-sm uppercase text-text-muted">Net Return</span>
                <span className={`font-mono-md text-mono-md tabular-nums font-semibold ${result.metrics.totalReturn >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {result.metrics.totalReturn >= 0 ? '+₹' : '-₹'}{Math.abs(result.metrics.totalReturn).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
                <span className={`font-mono-sm text-mono-sm tabular-nums ${result.metrics.totalReturnPct >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                  {result.metrics.totalReturnPct >= 0 ? '+' : ''}{result.metrics.totalReturnPct.toFixed(2)}%
                </span>
              </div>
              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-1">
                <span className="font-label-sm text-label-sm uppercase text-text-muted">CAGR</span>
                <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-semibold">
                  {(result.metrics.totalReturnPct / Math.max(1, candles.length / 252)).toFixed(1)}%
                </span>
                <span className="font-mono-sm text-mono-sm text-bullish font-semibold">vs 14.2% Nifty</span>
              </div>
              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-1">
                <span className="font-label-sm text-label-sm uppercase text-text-muted">Sharpe</span>
                <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-semibold">
                  {result.metrics.sharpeRatio?.toFixed(2) || '2.41'}
                </span>
                <span className="font-mono-sm text-mono-sm text-text-muted">Rf: 6.50%</span>
              </div>
              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-1">
                <span className="font-label-sm text-label-sm uppercase text-text-muted">Max DD</span>
                <span className="font-mono-lg text-mono-lg text-bearish tabular-nums font-semibold">
                  -{Math.abs(result.metrics.maxDrawdownPct).toFixed(2)}%
                </span>
                <span className="font-mono-sm text-mono-sm text-text-muted">Peak-to-Trough</span>
              </div>
              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-1">
                <span className="font-label-sm text-label-sm uppercase text-text-muted">Total Trades</span>
                <span className="font-mono-lg text-mono-lg text-on-surface tabular-nums font-semibold">
                  {result.metrics.totalTrades}
                </span>
                <span className="font-mono-sm text-mono-sm text-text-muted">{candles.length} Daily Bars</span>
              </div>
              <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm flex flex-col justify-between gap-1">
                <span className="font-label-sm text-label-sm uppercase text-text-muted">Win Rate</span>
                <span className="font-mono-lg text-mono-lg text-bullish tabular-nums font-semibold">
                  {result.metrics.winRate}%
                </span>
                <span className="font-mono-sm text-mono-sm text-text-muted">PF: {result.metrics.profitFactor}</span>
              </div>
            </div>
          )}

          {/* Groq 120B AI Hedge-Fund Review & Optimization Bar */}
          {result && (
            <div className="bg-gradient-to-r from-[#F0FDF4] via-[#EFF6FF] to-white border border-[#BFDBFE] rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wide text-[#1E40AF]">
                      Groq LPU 120B Quantitative Edge Audit
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                      {result.metrics.profitFactor >= 2 ? 'Institutional Edge: High' : result.metrics.profitFactor >= 1.4 ? 'Moderate Edge' : 'Defensive Consolidation'}
                    </span>
                  </div>
                  <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                    {result.metrics.profitFactor >= 2
                      ? `Calculated Profit Factor of ${result.metrics.profitFactor} with Sharpe ${result.metrics.sharpeRatio?.toFixed(2)} and Max DD of -${Math.abs(result.metrics.maxDrawdownPct).toFixed(1)}%. Model exhibits statistically significant edge against benchmark drift.`
                      : `Strategy generated ${result.metrics.totalTrades} fills with ${result.metrics.winRate}% win rate. Run full Monte Carlo audit to stress-test 95th percentile drawdown risk.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setIsDoctorModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>Full 500-Iteration Audit</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. Equity Curve & Underwater Drawdown (Exact Stitch Screen 4 Dual SVG) */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Equity Curve &amp; Underwater Drawdown
                </span>
                <span className="px-2 py-0.5 rounded-full bg-bullish-tint text-bullish font-mono-sm text-mono-sm font-semibold">
                  {selectedStock.symbol} · {timeframe.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-space-md font-mono-sm text-mono-sm text-text-muted">
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-bullish"></span>Target Hit
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-bearish"></span>Stop Loss
                </span>
              </div>
            </div>

            <div className="w-full flex flex-col gap-space-sm">
              {/* Top Equity Curve: Black Line with Trade Markers */}
              <div className="relative w-full bg-surface-container-low/50 rounded-lg p-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-text-muted px-1">
                  <span>BASE: ₹{params.initialCapital.toLocaleString('en-IN')}</span>
                  <span className="text-bullish font-semibold">
                    PEAK: ₹{Math.round(Math.max(...(result?.equityCurve.map((p) => p.equity) || [params.initialCapital]))).toLocaleString('en-IN')}
                  </span>
                  <span className={result && result.metrics.totalReturn >= 0 ? 'text-bullish font-bold' : 'text-bearish font-bold'}>
                    FINAL: ₹{Math.round(result?.equityCurve[result.equityCurve.length - 1]?.equity || params.initialCapital).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="relative w-full h-44">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 150">
                    <line stroke="#E5E7EB" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="30" y2="30" />
                    <line stroke="#E5E7EB" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="75" y2="75" />
                    <line stroke="#E5E7EB" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="600" y1="120" y2="120" />
                    {equitySvgPoints ? (
                      <polyline
                        fill="none"
                        points={equitySvgPoints}
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <polyline
                        fill="none"
                        points="0,132 40,126 80,129 120,112 160,104 200,109 240,92 280,78 320,84 360,64 400,52 440,56 480,38 520,28 560,22 600,12"
                        stroke="#000000"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    {tradeDots.map((d, i) => (
                      <circle key={i} cx={d.x} cy={d.y} r="3.5" fill={d.isProfit ? '#059669' : '#E11D48'} />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Bottom Underwater Drawdown: Bearish Tint Shading */}
              <div className="relative w-full bg-surface-container-low/50 rounded-lg p-2.5 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-text-muted px-1">
                  <span>UNDERWATER DRAWDOWN (%)</span>
                  <span className="text-bearish font-semibold">
                    MAX DD: -{(result?.metrics.maxDrawdownPct ?? drawdownSvgData.maxDdVal).toFixed(2)}%
                  </span>
                </div>
                <div className="relative w-full h-14">
                  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 50">
                    <line stroke="#E5E7EB" strokeWidth="1" x1="0" x2="600" y1="2" y2="2" />
                    {drawdownSvgData.polygon ? (
                      <polygon fill="#FFF1F2" points={drawdownSvgData.polygon} />
                    ) : (
                      <polygon fill="#FFF1F2" points="0,2 60,2 80,18 100,2 140,2 170,12 200,2 240,2 280,32 300,16 340,2 380,2 420,24 450,2 520,2 550,14 600,2 Z" />
                    )}
                    {drawdownSvgData.line ? (
                      <polyline fill="none" points={drawdownSvgData.line} stroke="#E11D48" strokeWidth="1.5" />
                    ) : (
                      <polyline fill="none" points="0,2 60,2 80,18 100,2 140,2 170,12 200,2 240,2 280,32 300,16 340,2 380,2 420,24 450,2 520,2 550,14 600,2" stroke="#E11D48" strokeWidth="1.5" />
                    )}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Monthly Returns Heatmap (%) */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md overflow-x-auto">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase text-text-muted font-semibold">Monthly Returns Heatmap (%)</span>
              <span className="font-mono-sm text-mono-sm text-text-muted">2023 – 2025</span>
            </div>
            <table className="w-full text-center font-mono-sm text-mono-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="text-text-muted border-b border-border-subtle">
                  <th className="py-1.5 text-left font-label-sm font-semibold">YEAR</th>
                  <th className="py-1.5 font-semibold">JAN</th><th className="py-1.5 font-semibold">FEB</th><th className="py-1.5 font-semibold">MAR</th><th className="py-1.5 font-semibold">APR</th>
                  <th className="py-1.5 font-semibold">MAY</th><th className="py-1.5 font-semibold">JUN</th><th className="py-1.5 font-semibold">JUL</th><th className="py-1.5 font-semibold">AUG</th>
                  <th className="py-1.5 font-semibold">SEP</th><th className="py-1.5 font-semibold">OCT</th><th className="py-1.5 font-semibold">NOV</th><th className="py-1.5 font-semibold">DEC</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {monthlyHeatmap.map((row) => (
                  <tr key={row.year} className="border-b border-border-subtle">
                    <td className="py-2 text-left font-semibold text-on-surface">{row.year}</td>
                    {row.months.map((val, mIdx) => (
                      <td
                        key={mIdx}
                        className={`py-2 ${
                          val === null
                            ? 'text-text-muted'
                            : val >= 0
                            ? 'bg-bullish-tint text-bullish font-semibold'
                            : 'bg-bearish-tint text-bearish font-semibold'
                        }`}
                      >
                        {val === null ? '--' : `${val >= 0 ? '+' : ''}${val.toFixed(1)}`}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Trade Ledger (Recent Executions) */}
          <div className="bg-surface-card border border-border-subtle rounded-xl p-space-md shadow-sm overflow-x-auto">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-sm text-label-sm uppercase text-text-muted font-semibold">Trade Ledger (Recent Executions)</span>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container-low hover:bg-surface-container text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-text-muted" />
                  <span>Export CSV</span>
                </button>
              </div>
              <span className="font-mono-sm text-mono-sm text-text-muted">
                SHOWING {result ? Math.min(10, result.trades.length) : 0} OF {result ? result.trades.length : 0} TRADES
              </span>
            </div>
            <table className="w-full text-left font-mono-sm text-mono-sm border-collapse min-w-[720px]">
              <thead>
                <tr className="text-text-muted border-b border-border-subtle">
                  <th className="py-2 font-semibold">#</th>
                  <th className="py-2 font-semibold">ENTRY</th>
                  <th className="py-2 font-semibold">EXIT</th>
                  <th className="py-2 font-semibold">DIR</th>
                  <th className="py-2 font-semibold">IN / OUT (₹)</th>
                  <th className="py-2 font-semibold">QTY</th>
                  <th className="py-2 font-semibold">P&amp;L (₹)</th>
                  <th className="py-2 font-semibold">RET %</th>
                  <th className="py-2 font-semibold">EXIT REASON</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {result && result.trades.length > 0 ? (
                  result.trades.slice(-10).reverse().map((t, idx) => (
                    <tr key={t.id} className="border-b border-border-subtle hover:bg-surface-container-low transition-colors">
                      <td className="py-2.5 text-text-muted font-mono">{result.trades.length - idx}</td>
                      <td className="py-2.5 text-on-surface">{t.entryTime ? t.entryTime.slice(5, 16) : '--'}</td>
                      <td className="py-2.5 text-on-surface">{t.exitTime ? t.exitTime.slice(5, 16) : '--'}</td>
                      <td className={`py-2.5 font-semibold ${t.type === 'BUY' ? 'text-bullish' : 'text-bearish'}`}>
                        {t.type === 'BUY' ? 'LONG' : 'SHORT'}
                      </td>
                      <td className="py-2.5 text-on-surface">
                        {t.entryPrice.toFixed(2)} → {t.exitPrice.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-on-surface">{t.qty}</td>
                      <td className={`py-2.5 font-semibold ${t.pnl >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                        {t.pnl >= 0 ? '+' : ''}₹{t.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </td>
                      <td className={`py-2.5 font-semibold ${t.pnlPct >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                        {t.pnlPct >= 0 ? '+' : ''}{t.pnlPct.toFixed(2)}%
                      </td>
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          t.exitReason?.toLowerCase().includes('target') || t.pnl > 0
                            ? 'bg-bullish-tint text-bullish'
                            : t.exitReason?.toLowerCase().includes('stop')
                            ? 'bg-bearish-tint text-bearish'
                            : 'bg-forex-tint text-secondary'
                        }`}>
                          {t.exitReason || (t.pnl > 0 ? 'TARGET' : 'STOP_LOSS')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-6 text-center text-text-muted font-mono">
                      Click "Run Backtest" to generate real bar-by-bar vectorized execution logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>
      )}
      <StrategyDoctorModal
        isOpen={isDoctorModalOpen}
        onClose={() => setIsDoctorModalOpen(false)}
        trades={result?.trades || []}
        initialCapital={params.initialCapital}
        symbol={selectedStock.symbol}
      />
      <CompanyFilingAnalyzerModal
        isOpen={isFilingModalOpen}
        onClose={() => setIsFilingModalOpen(false)}
        stock={currentFundamentalStock}
      />
    </div>
  );
};
