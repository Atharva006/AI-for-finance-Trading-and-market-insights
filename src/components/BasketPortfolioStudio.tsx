import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Upload,
  Download,
  Save,
  Play,
  RotateCcw,
  Check,
  TrendingUp,
  Briefcase,
  Sliders,
  Sparkles,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  AlertCircle,
  Database,
  PieChart,
} from 'lucide-react';
import { StrategyBasket, BasketItem, BasketBacktestResult, BasketStrategyType } from '../types/basket';
import {
  getSavedBaskets,
  saveBasket,
  deleteBasket,
  exportBasketAsJson,
  importBasketFromJson,
  DEFAULT_PRESET_BASKETS,
} from '../services/basketStore';
import { runBasketBacktest } from '../services/basketEngine';
import { POPULAR_NSE_STOCKS, fetchAllNseStocks, NseStock } from '../services/nseStocks';
import { EquityLineChart } from './EquityLineChart';
import { QuantRiskAlphaMatrix } from './QuantRiskAlphaMatrix';
import { QuantUnderwaterChart } from './QuantUnderwaterChart';
import { BasketDiversificationCard } from './BasketDiversificationCard';
import { StockLogo } from './StockLogo';
import {
  calculateBasketDiversification,
  getSuggestedDiversificationAdditions,
  SuggestedDiversificationPair,
} from '../services/portfolioDiversification';

export const BasketPortfolioStudio: React.FC = () => {
  const [baskets, setBaskets] = useState<StrategyBasket[]>([]);
  const [currentBasket, setCurrentBasket] = useState<StrategyBasket>(DEFAULT_PRESET_BASKETS[0]);
  const [allStocks, setAllStocks] = useState<NseStock[]>(POPULAR_NSE_STOCKS);
  const [isRunning, setIsRunning] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [result, setResult] = useState<BasketBacktestResult | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Add Item Modal / Inline State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addStockSearch, setAddStockSearch] = useState('');
  const [isStockSelectOpen, setIsStockSelectOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<NseStock>(
    POPULAR_NSE_STOCKS.find((s) => !s.isIndex && s.category !== 'INDEX') || POPULAR_NSE_STOCKS[0]
  );
  const [selectedStrategy, setSelectedStrategy] = useState<BasketStrategyType>('PSAR_SMA100');
  const [selectedTimeframe, setSelectedTimeframe] = useState('1d');
  const [selectedRpt, setSelectedRpt] = useState<number>(1.0);

  // Hidden file input for JSON upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = getSavedBaskets();
    setBaskets(loaded);
    if (loaded.length > 0) {
      setCurrentBasket(loaded[0]);
    }
    fetchAllNseStocks().then((stocks) => setAllStocks(stocks));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Run backtest automatically when currentBasket changes (or on manual run)
  const executeBasketBacktest = async (basketToRun = currentBasket) => {
    setIsRunning(true);
    setProgressMsg('Initializing multi-asset backtest engine...');
    try {
      const res = await runBasketBacktest(basketToRun, (msg) => setProgressMsg(msg));
      setResult(res);
      showToast(`Backtest completed for "${basketToRun.name}"!`);
    } catch (err: any) {
      console.error('Basket backtest failed:', err);
      showToast(`Error running backtest: ${err.message || 'Unknown'}`);
    } finally {
      setIsRunning(false);
      setProgressMsg('');
    }
  };

  // Run initial backtest on first mount
  useEffect(() => {
    executeBasketBacktest(currentBasket);
  }, [currentBasket.id]);

  // Save current basket
  const handleSaveBasket = () => {
    const updated = saveBasket(currentBasket);
    setBaskets(updated);
    showToast(`✓ Basket "${currentBasket.name}" saved successfully!`);
  };

  // Switch basket
  const handleSelectBasket = (b: StrategyBasket) => {
    setCurrentBasket(b);
    executeBasketBacktest(b);
  };

  // Update basket name
  const handleNameChange = (name: string) => {
    setCurrentBasket((prev) => ({ ...prev, name }));
  };

  // Update initial capital
  const handleCapitalChange = (val: number) => {
    setCurrentBasket((prev) => ({ ...prev, initialCapital: val }));
  };

  // Update item RPT
  const handleItemRptChange = (itemId: string, rpt: number) => {
    setCurrentBasket((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === itemId ? { ...it, riskPerTradePct: rpt } : it)),
    }));
  };

  // Update item timeframe
  const handleItemTfChange = (itemId: string, tf: string) => {
    setCurrentBasket((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === itemId ? { ...it, timeframe: tf } : it)),
    }));
  };

  // Update item strategy
  const handleItemStrategyChange = (itemId: string, st: BasketStrategyType) => {
    setCurrentBasket((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === itemId ? { ...it, strategyType: st } : it)),
    }));
  };

  // Toggle item enabled
  const handleToggleItem = (itemId: string) => {
    setCurrentBasket((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === itemId ? { ...it, enabled: !it.enabled } : it)),
    }));
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setCurrentBasket((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== itemId),
    }));
  };

  // Add new item
  const handleAddItem = () => {
    const newItem: BasketItem = {
      id: `item-${Date.now()}`,
      stock: selectedStock,
      strategyType: selectedStrategy,
      timeframe: selectedTimeframe,
      riskPerTradePct: selectedRpt,
      enabled: true,
    };
    const updatedBasket = {
      ...currentBasket,
      items: [...currentBasket.items, newItem],
    };
    setCurrentBasket(updatedBasket);
    setIsAddModalOpen(false);
    showToast(`Added ${selectedStock.symbol} (${selectedStrategy}) to basket`);
  };

  // Diversification Analysis & Smart Suggestion Engine
  const diversificationMetrics = useMemo(() => {
    return calculateBasketDiversification(currentBasket);
  }, [currentBasket]);

  const suggestedAdditions = useMemo(() => {
    return getSuggestedDiversificationAdditions(currentBasket);
  }, [currentBasket]);

  const handleAddSuggestion = (sugg: SuggestedDiversificationPair) => {
    const newItem: BasketItem = {
      id: `item-${Date.now()}`,
      stock: sugg.primaryStock,
      strategyType: sugg.recommendedStrategy,
      timeframe: sugg.recommendedTimeframe,
      riskPerTradePct: sugg.recommendedRptPct,
      enabled: true,
    };
    const updatedBasket = {
      ...currentBasket,
      items: [...currentBasket.items, newItem],
    };
    setCurrentBasket(updatedBasket);
    executeBasketBacktest(updatedBasket);
    showToast(
      `✓ Added ${sugg.primaryStock.symbol} (${sugg.recommendedStrategy}) · Diversification +${sugg.expectedScoreImprovement} pts!`
    );
  };

  // Export JSON
  const handleExportJson = () => {
    exportBasketAsJson(currentBasket);
    showToast(`Exported "${currentBasket.name}.json"`);
  };

  // Upload JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const imported = importBasketFromJson(content);
        const updatedBaskets = saveBasket(imported);
        setBaskets(updatedBaskets);
        setCurrentBasket(imported);
        executeBasketBacktest(imported);
        showToast(`✓ Uploaded and loaded basket "${imported.name}"!`);
      } catch (err: any) {
        alert(`Failed to import JSON basket: ${err.message}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredStocks = allStocks
    .filter(
      (s) =>
        s.symbol.toLowerCase().includes(addStockSearch.toLowerCase()) ||
        s.name.toLowerCase().includes(addStockSearch.toLowerCase())
    )
    .slice(0, 50);

  return (
    <div className="space-y-6">
      {/* Toast Notification (Stitch 100% Light Theme) */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-card text-on-surface px-5 py-3 rounded-xl shadow-xl border border-border-subtle flex items-center gap-3 text-xs font-mono animate-bounce">
          <Check className="w-4 h-4 text-bullish" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Hidden File Input for JSON Basket Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Basket Manager Top Header (Stitch Screen 5) */}
      <section className="bg-surface-card rounded-xl shadow-sm p-space-lg flex flex-col gap-space-md border border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm border-b border-border-subtle">
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase text-text-muted">01 / BASKET MANAGER</span>
            <div className="flex items-center gap-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Multi-Asset Portfolio Allocation Studio</h2>
              <span className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-bullish-tint text-bullish font-mono-sm text-mono-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-bullish"></span>
                ACTIVE BASKET
              </span>
            </div>
            {/* Editable Basket Name */}
            <input
              type="text"
              value={currentBasket.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter Basket Name..."
              className="text-lg font-bold text-on-surface tracking-tight bg-transparent border-b border-transparent hover:border-border-subtle focus:border-primary focus:outline-none transition-all w-full max-w-xl"
            />
          </div>

          {/* Action Buttons: Save, Upload JSON, Export JSON, Run */}
          {/* Action Buttons: New, Import JSON, Export JSON, Run */}
          <div className="flex flex-wrap items-center gap-space-sm">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-space-xs px-space-sm py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>Add Constituent</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-space-xs px-space-sm py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Import JSON</span>
            </button>

            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-space-xs px-space-sm py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export JSON</span>
            </button>

            <button
              onClick={handleSaveBasket}
              className="inline-flex items-center gap-space-xs px-space-sm py-space-sm rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-md text-label-md transition-colors cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              <span>Save Basket</span>
            </button>

            <button
              onClick={() => executeBasketBacktest()}
              disabled={isRunning}
              className="inline-flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors cursor-pointer disabled:opacity-50"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">{isRunning ? 'refresh' : 'play_arrow'}</span>
              <span>{isRunning ? 'Calculating...' : 'Run Basket Backtest'}</span>
            </button>
          </div>
        </div>

        {/* Saved Baskets Quick Switcher & Portfolio Capital */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider shrink-0 font-mono">
              Saved Baskets:
            </span>
            {baskets.map((b) => (
              <button
                key={b.id}
                onClick={() => handleSelectBasket(b)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  currentBasket.id === b.id
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-low text-text-secondary hover:text-on-surface'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-container-low border border-border-subtle px-3 py-1.5 rounded-lg text-xs font-mono">
              <span className="text-text-muted font-semibold">Portfolio Capital:</span>
              <span className="font-bold text-on-surface">₹</span>
              <input
                type="number"
                step="10000"
                value={currentBasket.initialCapital}
                onChange={(e) => handleCapitalChange(Number(e.target.value) || 100000)}
                className="w-24 bg-transparent font-bold text-on-surface focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Progress Bar when running */}
      {isRunning && (
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono text-gray-700 font-semibold">{progressMsg}</span>
          </div>
          <span className="text-[11px] font-mono text-gray-400">Yahoo & Upstox Historical Data Feeds</span>
        </div>
      )}

      {/* Modern Portfolio Theory Diversification Factor & Pair Suggestion Engine */}
      <BasketDiversificationCard
        metrics={diversificationMetrics}
        suggestions={suggestedAdditions}
        onAddSuggestion={handleAddSuggestion}
      />

      {/* Multi-Stock & Multi-System Basket Configuration Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <h4 className="text-sm font-bold text-[#0A0A0D]">
              Basket Assets & Strategies ({currentBasket.items.length} Loaded)
            </h4>
          </div>
          <span className="text-xs font-mono text-gray-400">
            Each stock executes its own system with dedicated Risk Per Trade (RPT)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#FAFAFC] border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">Active</th>
                <th className="py-3 px-4">NSE Stock / Index Asset</th>
                <th className="py-3 px-4">Strategy System</th>
                <th className="py-3 px-4">Timeframe</th>
                <th className="py-3 px-4 text-center">RPT (% Risk)</th>
                <th className="py-3 px-4 text-right">Risk Amount (₹)</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentBasket.items.map((item) => {
                const riskVal = (currentBasket.initialCapital * item.riskPerTradePct) / 100;
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition-colors ${!item.enabled ? 'opacity-40 bg-gray-50/50' : ''}`}
                  >
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        onChange={() => handleToggleItem(item.id)}
                        className="w-4 h-4 rounded text-black accent-black cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <StockLogo symbol={item.stock.symbol} instrumentKey={item.stock.instrument_key} name={item.stock.name} size="sm" />
                        <div>
                          <div className="font-bold text-[#0A0A0D] flex items-center gap-1.5">
                            <span>{item.stock.symbol}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-sans block truncate max-w-xs">
                            {item.stock.name}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.strategyType}
                        onChange={(e) => handleItemStrategyChange(item.id, e.target.value as BasketStrategyType)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0A0A0D] focus:outline-none focus:border-black"
                      >
                        <option value="TREND_PULLBACK_CHANDELIER">Trend-Pullback 1% Chandelier</option>
                        <option value="PSAR_SMA100">PSAR + SMA100 Swing</option>
                        <option value="OPENING_RANGE">ORB 5M Breakout</option>
                        <option value="STOCHASTIC">Stochastic ATR Inflection</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={item.timeframe}
                        onChange={(e) => handleItemTfChange(item.id, e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0A0A0D] focus:outline-none focus:border-black"
                      >
                        <option value="1d">1D (Daily)</option>
                        <option value="4h">4H (4 Hours)</option>
                        <option value="1h">1H (60 Min)</option>
                        <option value="15m">15M</option>
                        <option value="5m">5M</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {/* RPT Column with editable input */}
                      <div className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="10.0"
                          value={item.riskPerTradePct}
                          onChange={(e) => handleItemRptChange(item.id, parseFloat(e.target.value) || 1.0)}
                          className="w-12 bg-transparent text-center font-bold text-emerald-800 text-xs focus:outline-none"
                        />
                        <span className="text-emerald-700 font-bold">%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-700">
                      ₹{riskVal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Remove stock from basket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Combined Executive Metrics Cards */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">COMBINED RETURN</span>
            <span
              className={`text-2xl font-bold font-mono mt-1 block ${
                result.totalReturn >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {result.totalReturn >= 0 ? '+' : ''}
              {result.totalReturnPct}%
            </span>
            <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">
              ₹ {result.totalReturn.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">PORTFOLIO WIN RATE</span>
            <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">{result.winRate}%</span>
            <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">
              {result.winningTrades} / {result.totalTrades} Winning Trades
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">PROFIT FACTOR</span>
            <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">{result.profitFactor}</span>
            <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">Gross Profit / Loss</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">MAX DRAWDOWN</span>
            <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">-{result.maxDrawdownPct}%</span>
            <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">
              ₹ -{result.maxDrawdownVal.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <span className="text-[11px] text-gray-400 block font-semibold uppercase font-mono">FINAL EQUITY</span>
            <span className="text-2xl font-bold font-mono text-[#0A0A0D] mt-1 block">
              ₹{result.finalCapital.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[11px] text-gray-500 font-mono mt-0.5 block">
              Across {currentBasket.items.filter((i) => i.enabled).length} Systems
            </span>
          </div>
        </div>
      )}

      {/* COMBINED PORTFOLIO EQUITY CURVE LINE CHART */}
      {result && result.equityCurve.length > 0 && (
        <>
          <EquityLineChart
            equityCurve={result.equityCurve}
            initialCapital={result.initialCapital}
            title={`Combined Portfolio Equity Curve · "${result.basketName}"`}
            subtitle="Unified multi-strategy capital trajectory with individual Risk Per Trade (RPT) sizing"
            strokeColor="#16A34A"
            fillGradStart="#16A34A"
          />

          {/* Institutional Quantitative Risk & Alpha Matrix (QRAM) */}
          <QuantRiskAlphaMatrix
            trades={result.trades}
            initialCapital={result.initialCapital}
            symbol={currentBasket.name}
            strategyName="Multi-Asset Basket"
          />

          {/* Quant High-Water Mark Underwater Drawdown Excursion Chart */}
          <QuantUnderwaterChart
            trades={result.trades}
            initialCapital={result.initialCapital}
          />
        </>
      )}

      {/* Per-Asset Breakdown Table */}
      {result && result.breakdown.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#0A0A0D] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Per-Asset Multi-System Performance Breakdown
            </h4>
            <span className="text-xs font-mono text-gray-400">Sorted by Basket Allocation</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAFAFC] border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Symbol</th>
                  <th className="py-3 px-4">System Strategy</th>
                  <th className="py-3 px-4">Timeframe</th>
                  <th className="py-3 px-4 text-center">RPT (%)</th>
                  <th className="py-3 px-4 text-center">Trades</th>
                  <th className="py-3 px-4 text-center">Win Rate</th>
                  <th className="py-3 px-4 text-center">Profit Factor</th>
                  <th className="py-3 px-4 text-right">Net PnL (₹)</th>
                  <th className="py-3 px-4 text-right">Return %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.breakdown.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#0A0A0D]">{row.symbol}</td>
                    <td className="py-3 px-4">
                      <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {row.strategyType === 'TREND_PULLBACK_CHANDELIER'
                          ? 'Trend-Pullback Chandelier'
                          : row.strategyType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-semibold">{row.timeframe.toUpperCase()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {row.rptPct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">{row.totalTrades}</td>
                    <td className="py-3 px-4 text-center font-bold">{row.winRate}%</td>
                    <td className="py-3 px-4 text-center font-bold">{row.profitFactor}</td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        row.netPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.netPnl >= 0 ? '+' : ''}₹{row.netPnl.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold ${
                        row.returnPct >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {row.returnPct >= 0 ? '+' : ''}
                      {row.returnPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unified Chronological Trades Log with Dedicated RPT Column */}
      {result && result.trades.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#0A0A0D] flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              Unified Basket Trades Log ({result.trades.length} Combined Trades)
            </h4>
            <span className="text-xs font-mono text-gray-400">
              Chronological execution order with RPT sizing
            </span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAFAFC] border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px] sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4">Trade ID</th>
                  <th className="py-2.5 px-4">Stock</th>
                  <th className="py-2.5 px-4">System</th>
                  <th className="py-2.5 px-4 text-center">Type</th>
                  <th className="py-2.5 px-4 text-center">RPT Col</th>
                  <th className="py-2.5 px-4">Entry (Date / Price)</th>
                  <th className="py-2.5 px-4">Exit (Date / Price)</th>
                  <th className="py-2.5 px-4 text-center">Reason</th>
                  <th className="py-2.5 px-4 text-right">Net PnL (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {result.trades.map((tr) => {
                  const isWin = tr.pnl > 0;
                  return (
                    <tr key={tr.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-4 text-gray-500 font-bold">{tr.id}</td>
                      <td className="py-2 px-4 font-bold text-[#0A0A0D]">{tr.symbol}</td>
                      <td className="py-2 px-4 text-gray-600 font-semibold">
                        {tr.strategyType === 'TREND_PULLBACK_CHANDELIER' ? 'Trend-Pullback Chandelier' : tr.strategyType}
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            tr.type === 'BUY' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {tr.type}
                        </span>
                      </td>
                      {/* RPT Column */}
                      <td className="py-2 px-4 text-center">
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                          {tr.rptPct}% (₹{Math.round(tr.riskAmount)})
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-gray-500 block text-[11px]">{tr.entryTime}</span>
                        <span className="font-bold text-black">₹{tr.entryPrice.toFixed(2)}</span>
                      </td>
                      <td className="py-2 px-4">
                        <span className="text-gray-500 block text-[11px]">{tr.exitTime}</span>
                        <span className="font-bold text-black">₹{tr.exitPrice.toFixed(2)}</span>
                      </td>
                      <td className="py-2 px-4 text-center">
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{tr.exitReason}</span>
                      </td>
                      <td
                        className={`py-2 px-4 text-right font-bold ${
                          isWin ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isWin ? '+' : ''}₹{tr.pnl.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        <span className="text-[10px] block opacity-75">({tr.pnlPct.toFixed(1)}%)</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Stock & System Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-[#0A0A0D]">Add Stock & System to Basket</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-black font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Stock Search & Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 block">Select NSE Stock or Index</label>
              <div className="relative">
                <div
                  onClick={() => setIsStockSelectOpen(!isStockSelectOpen)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 flex items-center justify-between cursor-pointer hover:border-black"
                >
                  <span className="font-bold text-sm text-[#0A0A0D]">
                    {selectedStock.symbol} - {selectedStock.name}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>

                {isStockSelectOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto p-2 space-y-1">
                    <input
                      type="text"
                      placeholder="Search 3,797 NSE equities..."
                      value={addStockSearch}
                      onChange={(e) => setAddStockSearch(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs mb-2 focus:outline-none focus:border-black"
                      autoFocus
                    />
                    {filteredStocks.map((s) => (
                      <div
                        key={s.symbol}
                        onClick={() => {
                          setSelectedStock(s);
                          setIsStockSelectOpen(false);
                        }}
                        className="p-2 hover:bg-gray-50 rounded-lg flex items-center justify-between cursor-pointer text-xs"
                      >
                        <div>
                          <span className="font-bold text-black">{s.symbol}</span>
                          <span className="text-gray-500 ml-2">{s.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Strategy Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-600 block">Strategy System</label>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value as BasketStrategyType)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#0A0A0D] focus:outline-none focus:border-black"
              >
                <option value="TREND_PULLBACK_CHANDELIER">Nifty 50 Daily Trend-Pullback</option>
                <option value="PSAR_SMA100">PSAR + SMA 100 Trend Following</option>
                <option value="OPENING_RANGE">ORB 5M Breakout (Pure Price Action)</option>
                <option value="STOCHASTIC">Stochastic Momentum Oscillator (%K, %D)</option>
              </select>
            </div>

            {/* Timeframe & RPT Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">Execution Timeframe</label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#0A0A0D] focus:outline-none focus:border-black"
                >
                  <option value="1d">1D (Daily Candles)</option>
                  <option value="4h">4H (4 Hours)</option>
                  <option value="1h">1H (60 Minutes)</option>
                  <option value="15m">15M</option>
                  <option value="5m">5M</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 block">Risk Per Trade (RPT %)</label>
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10.0"
                    value={selectedRpt}
                    onChange={(e) => setSelectedRpt(parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-transparent font-bold text-xs text-black focus:outline-none"
                  />
                  <span className="text-gray-500 font-bold text-xs">%</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="px-5 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold hover:bg-primary-container shadow-sm transition-all cursor-pointer"
              >
                Add to Basket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
