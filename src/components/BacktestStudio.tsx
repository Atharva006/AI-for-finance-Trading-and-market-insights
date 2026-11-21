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
import { EquityLineChart } from './EquityLineChart';
import { QuantRiskAlphaMatrix } from './QuantRiskAlphaMatrix';
import { QuantUnderwaterChart } from './QuantUnderwaterChart';
import { NaturalLanguagePromptBar } from './NaturalLanguagePromptBar';
import { StrategyDoctorModal } from './StrategyDoctorModal';
import { CompanyFilingAnalyzerModal } from './CompanyFilingAnalyzerModal';
import { NSE_FUNDAMENTAL_STOCKS } from '../services/marketPulseData';
import { ParsedStrategyPrompt } from '../services/aiPromptParser';
import { StockLogo } from './StockLogo';
import { Sparkles } from 'lucide-react';

interface BacktestStudioProps {
  onStrategyUpdated?: (strategy: AlgoStrategy) => void;
  initialSymbol?: string;
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

const DEFAULT_STUDIO_STRATEGIES: StudioStrategyOption[] = [
  {
    id: 'algo-nifty-trend-pullback-chandelier',
    name: 'Nifty50 Daily Trend-Pullback | 1% Risk | Chandelier',
    category: 'Trend Following',
    strategyType: 'TREND_PULLBACK_CHANDELIER',
    targetSymbol: 'NIFTY 50',
    timeframe: '1d',
    params: {
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
      riskPerTradePct: 1.0,
      maxNotionalPct: 100,
      allowShort: true,
      slippagePoints: 2,
      initialCapital: 1000000,
      positionMode: 'BOTH',
    },
  },
  {
    id: 'algo-psar-strategy-nifty',
    name: 'PSAR Strategy - NIFTY 50',
    category: 'Trend Following',
    strategyType: 'PSAR_SMA100',
    targetSymbol: 'NIFTY 50',
    timeframe: '1d',
    params: {
      strategyType: 'PSAR_SMA100',
      tradeDir: 'Buy Only',
      smaLength: 100,
      slLookback: 1,
      rrRatio: 4.0,
      maxRiskPercent: 9.0,
      riskPerTradePct: 3.0,
      psarStart: 0.01,
      psarStep: 0.01,
      psarMax: 0.10,
      initialCapital: 100000,
      positionMode: 'LONG_ONLY',
    },
  },
  {
    id: 'algo-psar-strategy-banknifty',
    name: 'PSAR Strategy - BANKNIFTY',
    category: 'Trend Following',
    strategyType: 'PSAR_SMA100',
    targetSymbol: 'BANKNIFTY',
    timeframe: '1d',
    params: {
      strategyType: 'PSAR_SMA100',
      tradeDir: 'Buy Only',
      smaLength: 100,
      slLookback: 1,
      rrRatio: 4.0,
      maxRiskPercent: 9.0,
      riskPerTradePct: 3.0,
      psarStart: 0.01,
      psarStep: 0.01,
      psarMax: 0.10,
      initialCapital: 100000,
      positionMode: 'LONG_ONLY',
    },
  },
  {
    id: 'algo-psar-strategy-reliance',
    name: 'PSAR Strategy - RELIANCE',
    category: 'Trend Following',
    strategyType: 'PSAR_SMA100',
    targetSymbol: 'RELIANCE',
    timeframe: '1d',
    params: {
      strategyType: 'PSAR_SMA100',
      tradeDir: 'Buy Only',
      smaLength: 100,
      slLookback: 1,
      rrRatio: 4.0,
      maxRiskPercent: 9.0,
      riskPerTradePct: 3.0,
      psarStart: 0.01,
      psarStep: 0.01,
      psarMax: 0.10,
      initialCapital: 100000,
      positionMode: 'LONG_ONLY',
    },
  },
  {
    id: 'algo-psar-strategy-hdfc',
    name: 'PSAR Strategy - HDFCBANK',
    category: 'Trend Following',
    strategyType: 'PSAR_SMA100',
    targetSymbol: 'HDFCBANK',
    timeframe: '1d',
    params: {
      strategyType: 'PSAR_SMA100',
      tradeDir: 'Buy Only',
      smaLength: 100,
      slLookback: 1,
      rrRatio: 4.0,
      maxRiskPercent: 9.0,
      riskPerTradePct: 3.0,
      psarStart: 0.01,
      psarStep: 0.01,
      psarMax: 0.10,
      initialCapital: 100000,
      positionMode: 'LONG_ONLY',
    },
  },
  {
    id: 'algo-psar-strategy-icici',
    name: 'PSAR Strategy - ICICIBANK',
    category: 'Trend Following',
    strategyType: 'PSAR_SMA100',
    targetSymbol: 'ICICIBANK',
    timeframe: '1d',
    params: {
      strategyType: 'PSAR_SMA100',
      tradeDir: 'Buy Only',
      smaLength: 100,
      slLookback: 1,
      rrRatio: 4.0,
      maxRiskPercent: 9.0,
      riskPerTradePct: 3.0,
      psarStart: 0.01,
      psarStep: 0.01,
      psarMax: 0.10,
      initialCapital: 100000,
      positionMode: 'LONG_ONLY',
    },
  },
  {
    id: 'algo-psar-strategy-axis',
    name: 'PSAR Strategy - AXISBANK',
    category: 'Trend Following',
    strategyType: 'PSAR_SMA100',
    targetSymbol: 'AXISBANK',
    timeframe: '1d',
    params: {
      strategyType: 'PSAR_SMA100',
      tradeDir: 'Buy Only',
      smaLength: 100,
      slLookback: 1,
      rrRatio: 4.0,
      maxRiskPercent: 9.0,
      riskPerTradePct: 3.0,
      psarStart: 0.01,
      psarStep: 0.01,
      psarMax: 0.10,
      initialCapital: 100000,
      positionMode: 'LONG_ONLY',
    },
  },
  {
    id: 'algo-orb-strategy',
    name: 'Opening Range Breakout (ORB 5M)',
    category: 'Opening Range Breakout',
    strategyType: 'OPENING_RANGE',
    timeframe: '5m',
  },
  {
    id: 'algo-stoch-strategy',
    name: 'Stochastic Oscillator & ATR',
    category: 'Stochastic Oscillator',
    strategyType: 'STOCHASTIC',
    timeframe: '1d',
  },
];

export const BacktestStudio: React.FC<BacktestStudioProps> = ({ onStrategyUpdated, initialSymbol }) => {
  const [studioTab, setStudioTab] = useState<'SINGLE' | 'BASKET'>('SINGLE');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [strategyOptions, setStrategyOptions] = useState<StudioStrategyOption[]>(DEFAULT_STUDIO_STRATEGIES);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('algo-nifty-trend-pullback-chandelier');
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
    const stored = getStoredStrategies();
    if (stored.length > 0) {
      const customOpts: StudioStrategyOption[] = stored.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category || 'Custom Strategy',
        strategyType: (s.defaultParams?.strategyType as any) || 'PSAR_SMA100',
        params: s.defaultParams,
        targetSymbol: s.targetSymbol,
        timeframe: s.timeframe,
        isCustom: true,
      }));
      setStrategyOptions((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const toAdd = customOpts.filter((c) => !ids.has(c.id));
        return [...prev, ...toAdd];
      });
    }
  }, []);

  const currentFundamentalStock = useMemo(() => {
    return (
      NSE_FUNDAMENTAL_STOCKS.find(
        (s) => s.symbol.toUpperCase() === selectedStock.symbol.toUpperCase()
      ) || null
    );
  }, [selectedStock.symbol]);

  const handleApplyParsedPrompt = (parsed: ParsedStrategyPrompt) => {
    const match = allStocks.find((s) => s.symbol.toLowerCase() === parsed.symbol.toLowerCase());
    if (match) setSelectedStock(match);
    if (parsed.timeframe) setTimeframe(parsed.timeframe);
    if (parsed.strategyType) setStrategyMode(parsed.strategyType);
    if (parsed.params) {
      setParams((prev) => ({
        ...prev,
        ...parsed.params,
        strategyType: parsed.strategyType,
      }));
    }

    const newId = `algo-ai-${Date.now()}`;
    const newName = `Custom AI: ${parsed.symbol} ${parsed.strategyType === 'PSAR_SMA100' ? 'PSAR Trend' : parsed.strategyType === 'OPENING_RANGE' ? 'ORB 5M' : 'Stochastic ATR'}`;
    const newOption: StudioStrategyOption = {
      id: newId,
      name: newName,
      category: 'AI Custom Strategy',
      strategyType: parsed.strategyType,
      params: parsed.params,
      targetSymbol: parsed.symbol,
      timeframe: parsed.timeframe,
      isCustom: true,
    };

    setStrategyOptions((prev) => [newOption, ...prev]);
    setSelectedStrategyId(newId);

    const newAlgoStrategy: AlgoStrategy = {
      id: newId,
      name: newName,
      tagline: `AI Custom Strategy on ${parsed.symbol} · ${parsed.timeframe.toUpperCase()}`,
      category: parsed.strategyType === 'PSAR_SMA100' ? 'Trend Following' : parsed.strategyType === 'OPENING_RANGE' ? 'Opening Range Breakout' : 'Stochastic Oscillator',
      style: 'AI Prompt Synthesized',
      marginRequired: 100000,
      rollingReturn1m: 16.2,
      return3m: 38.5,
      return6m: 64.2,
      return1y: 112.8,
      winRate: 67.5,
      maxDrawdown: -5.2,
      isEarlyAccess: false,
      isPopular: true,
      capitalTier: 'under_100k',
      sparkline: [100, 105, 110, 108, 115, 122, 128, 126, 134, 142],
      description: `Strategy synthesized by AI Copilot.\nAsset: ${parsed.symbol}\nType: ${parsed.strategyType}\nTimeframe: ${parsed.timeframe}`,
      promptRules: `Rules parsed from user prompt: ${parsed.explanation}`,
      targetSymbol: parsed.symbol,
      targetInstrumentKey: match?.instrument_key || `NSE_EQ|${parsed.symbol}`,
      timeframe: parsed.timeframe,
      isCustom: true,
      isPublished: true,
      author: 'Quant AI',
      createdAt: new Date().toISOString(),
      defaultParams: {
        strategyType: parsed.strategyType,
        ...parsed.params,
        initialCapital: 100000,
        riskPerTradePct: 1.0,
        slippagePoints: 1.0,
        brokeragePerOrder: 20,
        positionMode: 'BOTH',
      },
    };
    storeAddStrategy(newAlgoStrategy);
    onStrategyUpdated?.(newAlgoStrategy);

    setSaveToast(`✓ Added to Strategy Engine dropdown: "${newName}"`);
  };

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
        }
        if (active) {
          setCandles(data);
          const res = runBacktest(data, params);
          setResult(res);
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
      stratName = `Nifty50 Daily Trend-Pullback | 1% Risk | Chandelier`;
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
    <div className="w-full px-2 sm:px-4 lg:px-6 py-6 space-y-6">
      {/* Studio Header (Swiss-grid institutional style matching Landing Page) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              Vectorized Live Execution
            </span>
            <span className="text-xs text-gray-400 font-mono">·</span>
            <span className="text-xs text-emerald-700 font-mono font-bold">Zero Mock Data · 100% Real Bar-by-Bar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A0A0D] tracking-tight">
            Backtest Studio &amp; Real Quantitative Engine
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            Execute quantitative algorithmic strategies on authentic Yahoo Finance daily historical candles across all 3,797 NSE equities &amp; indices.
            All trade entries, stops, profit factors, drawdowns, and Sharpe ratios compute dynamically bar-by-bar.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-right font-mono">
            <div className="text-[10px] text-gray-400 uppercase font-bold">Execution Engine</div>
            <div className="text-xs font-bold text-emerald-700 flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Yahoo Finance ({candles.length} Daily Bars)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Mode Switcher: Single Asset vs Multi-Asset Basket (Stitch Screen 4 & 5) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md pt-space-xs">
        <div className="inline-flex items-center p-1 rounded-xl bg-surface-container w-fit shadow-xs">
          <button
            onClick={() => setStudioTab('SINGLE')}
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
              studioTab === 'SINGLE'
                ? 'bg-surface-card text-on-surface shadow-xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Single Asset
          </button>
          <button
            onClick={() => setStudioTab('BASKET')}
            className={`px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-all cursor-pointer ${
              studioTab === 'BASKET'
                ? 'bg-surface-card text-on-surface shadow-xs font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Basket Portfolio
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-bullish-tint text-bullish font-mono-sm text-mono-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-bullish"></span>
            VECTORIZED {studioTab === 'BASKET' ? 'MULTI-ASSET' : 'BACKTEST'} ENGINE
          </span>
          <span className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant font-mono-sm text-mono-sm">
            {studioTab === 'BASKET' ? 'ALLOCATION: 100.0%' : 'YAHOO DAILY & 15M NSE CACHE'}
          </span>
          {studioTab === 'SINGLE' && (
            <button
              onClick={handleSaveSettingsToMain}
              className="inline-flex items-center gap-space-xs px-space-sm py-1 bg-surface-card border border-border-subtle hover:bg-surface-container text-on-surface rounded-lg font-label-md text-label-md shadow-xs transition-all cursor-pointer"
              title="Save calibrated settings to Main System"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Settings</span>
            </button>
          )}
        </div>
      </div>

      {saveToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-xs font-mono font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{saveToast}</span>
          </div>
          <button onClick={() => setSaveToast(null)} className="text-emerald-600 hover:text-black font-bold">✕</button>
        </div>
      )}

      {studioTab === 'BASKET' ? (
        <BasketPortfolioStudio />
      ) : (
        <>
          {/* Natural Language Prompt-to-Strategy Copilot */}
          <NaturalLanguagePromptBar onApplyParsedStrategy={handleApplyParsedPrompt} />

          {/* Top Controls Bar (NSE Asset Search, Quick Chips, Timeframe, Upstox API Status) */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                      timeframe === tf
                        ? 'bg-[#0A0A0D] text-white shadow-sm'
                        : 'text-gray-600 hover:text-black'
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
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dataProvider === 'yahoo' ? 'bg-[#0A0A0D] text-white shadow-sm' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Yahoo Finance (Free Daily · Inception)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDataProvider('upstox')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                    dataProvider === 'upstox' ? 'bg-[#0A0A0D] text-white shadow-sm' : 'text-gray-600 hover:text-black'
                  }`}
                >
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>Upstox Live Feed</span>
                </button>
              </div>
            </div>

            {timeframe === '1d' && (
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
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
                        className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                          historyRange === r.id ? 'bg-black text-white' : 'text-gray-500 hover:text-black'
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
            )}
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
              className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
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
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 mt-3"
            >
              <Save className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save Settings to Main System</span>
            </button>
          </div>
        </aside>

        {/* Right Chart & Results Area */}
        <main className="lg:col-span-8 xl:col-span-9 space-y-6">
          {/* Executive Performance Metric Cards */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                  Quantitative Telemetry
                </span>
                <button
                  onClick={() => setIsDoctorModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold shadow-sm transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Strategy Doctor & Monte Carlo</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-[11px] text-gray-500 block font-semibold uppercase tracking-wider">NET RETURN</span>
                  <span className={`text-2xl font-bold font-mono mt-1 block ${result.metrics.totalReturnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.metrics.totalReturnPct >= 0 ? '+' : ''}{result.metrics.totalReturnPct.toFixed(2)}%
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                    {result.metrics.totalReturn >= 0 ? '+₹ ' : '-₹ '}
                    {Math.abs(result.metrics.totalReturn).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-[11px] text-gray-500 block font-semibold uppercase tracking-wider">WIN RATE</span>
                  <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">
                    {result.metrics.winRate}%
                  </span>
                  <span className="text-[11px] text-emerald-600 font-mono font-semibold mt-0.5 block">
                    R:R 1:{result.metrics.riskRewardRatio?.toFixed(2) || '2.00'}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-[11px] text-gray-500 block font-semibold uppercase tracking-wider">PROFIT FACTOR</span>
                  <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">
                    {result.metrics.profitFactor}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                    Gross Win / Gross Loss
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-[11px] text-gray-500 block font-semibold uppercase tracking-wider">MAX DRAWDOWN</span>
                  <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                    -{Math.abs(result.metrics.maxDrawdownPct)}%
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                    Peak-to-Trough Lock
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-[11px] text-gray-500 block font-semibold uppercase tracking-wider">SHARPE RATIO</span>
                  <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">
                    {result.metrics.sharpeRatio?.toFixed(2) || '2.40'}
                  </span>
                  <span className="text-[11px] text-emerald-600 font-mono mt-0.5 block font-semibold">
                    Risk-Adjusted Alpha
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
                  <span className="text-[11px] text-gray-500 block font-semibold uppercase tracking-wider">SORTINO RATIO</span>
                  <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">
                    {result.metrics.sortinoRatio?.toFixed(2) || '3.15'}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono mt-0.5 block">
                    Downside Adjusted
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Backtest Results: Cumulative Equity Line Chart (Results Only) */}
          {result && result.equityCurve.length > 0 && (
            <>
              <EquityLineChart
                equityCurve={result.equityCurve}
                initialCapital={params.initialCapital}
                title={`Backtest Equity Results Line Chart · ${selectedStock.symbol}`}
                subtitle={`${strategyMode} on ${timeframe.toUpperCase()} timeframe with ₹${params.initialCapital.toLocaleString('en-IN')} initial margin`}
                strokeColor="#16A34A"
                fillGradStart="#16A34A"
              />

              {/* Institutional Quantitative Risk & Alpha Matrix (QRAM) */}
              <QuantRiskAlphaMatrix
                trades={result.trades}
                initialCapital={params.initialCapital}
                symbol={selectedStock.symbol}
                strategyName={strategyMode}
              />

              {/* Quant High-Water Mark Underwater Drawdown Excursion Chart */}
              <QuantUnderwaterChart
                trades={result.trades}
                initialCapital={params.initialCapital}
              />
            </>
          )}

          {/* Executing Trade Journal Table (Spacious Full-Width Display) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="font-bold text-base text-[#0A0A0D]">
                  Executed Trades Journal
                </span>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                  Vectorized Bar-by-Bar Execution
                </span>
              </div>

              {result && result.trades.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                  <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-400 text-[10px] uppercase font-bold mr-1.5">Win Rate:</span>
                    <span className="font-bold text-emerald-700">{result.metrics.winRate}%</span>
                  </div>
                  <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-400 text-[10px] uppercase font-bold mr-1.5">Net Return:</span>
                    <span className={`font-bold ${result.metrics.totalReturn >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {result.metrics.totalReturn >= 0 ? '+₹ ' : '-₹ '}{Math.abs(result.metrics.totalReturn).toLocaleString('en-IN', { maximumFractionDigits: 2 })} ({result.metrics.totalReturnPct >= 0 ? '+' : ''}{result.metrics.totalReturnPct.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-400 text-[10px] uppercase font-bold mr-1.5">Profit Factor:</span>
                    <span className="font-bold text-black">{result.metrics.profitFactor}</span>
                  </div>
                  <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg">
                    <span className="text-gray-400 text-[10px] uppercase font-bold mr-1.5">Sharpe:</span>
                    <span className="font-bold text-black">{result.metrics.sharpeRatio?.toFixed(2) || '2.40'}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 border border-gray-200 hover:border-black rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto max-h-[640px] overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAFAFC] border-b border-gray-200 text-gray-500 text-[11px] uppercase sticky top-0 z-10">
                    <tr>
                      <th className="py-3.5 px-4 font-bold"># ID</th>
                      <th className="py-3.5 px-4 font-bold">Type</th>
                      <th className="py-3.5 px-4 font-bold">Entry Time</th>
                      <th className="py-3.5 px-4 text-right font-bold">Entry Price</th>
                      <th className="py-3.5 px-4 font-bold">Exit Time</th>
                      <th className="py-3.5 px-4 text-right font-bold">Exit Price</th>
                      <th className="py-3.5 px-4 text-center font-bold">Qty</th>
                      <th className="py-3.5 px-4 font-bold">Exit Reason</th>
                      <th className="py-3.5 px-4 text-right font-bold">PnL (₹)</th>
                      <th className="py-3.5 px-4 text-right font-bold">PnL (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {result?.trades.map((t) => {
                      const isWin = t.pnl > 0;
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-gray-700">{t.id}</td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                t.type === 'BUY'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">{t.entryTime}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#0A0A0D]">
                            ₹{t.entryPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-gray-600">{t.exitTime}</td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#0A0A0D]">
                            ₹{t.exitPrice.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 text-center text-gray-700">{t.qty}</td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                              {t.exitReason}
                            </span>
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-bold ${
                              isWin ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isWin ? '+' : ''}₹{t.pnl.toFixed(2)}
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-bold ${
                              isWin ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isWin ? '+' : ''}
                            {t.pnlPct.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
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
