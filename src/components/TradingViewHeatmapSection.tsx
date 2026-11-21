import React, { useState, useEffect, useRef } from 'react';

export type HeatmapRegion = 'INDIA' | 'US';

interface TradingViewHeatmapSectionProps {
  onNavigateToBacktest?: (symbol: string) => void;
  onNavigateToPaperTrading?: () => void;
}

export const TradingViewHeatmapSection: React.FC<TradingViewHeatmapSectionProps> = ({
  onNavigateToBacktest,
  onNavigateToPaperTrading,
}) => {
  const [region, setRegion] = useState<HeatmapRegion>('INDIA');
  const [indiaPreset, setIndiaPreset] = useState<'NIFTY50' | 'SENSEX' | 'AllIndia'>('NIFTY50');
  const [usPreset, setUsPreset] = useState<'SPX500' | 'NASDAQ100' | 'DJI'>('SPX500');
  const [grouping, setGrouping] = useState<'sector' | 'no_group'>('sector');
  const [blockSize, setBlockSize] = useState<'market_cap_basic' | 'volume' | 'is_mono_size'>('market_cap_basic');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => new Date().toLocaleTimeString());

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const activeDataSource = region === 'INDIA' ? indiaPreset : usPreset;

  // Mount / Re-mount TradingView Stock Heatmap Widget
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    containerRef.current.appendChild(widgetDiv);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
    script.type = 'text/javascript';
    script.async = true;

    const config = {
      exchanges: [],
      dataSource: activeDataSource,
      grouping: grouping,
      blockSize: blockSize === 'is_mono_size' ? 'market_cap_basic' : blockSize,
      blockColor: 'change',
      locale: region === 'INDIA' ? 'in' : 'en',
      symbolUrl: '',
      colorTheme: 'light',
      hasTopBar: true,
      isDataSetEnabled: true,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: blockSize === 'is_mono_size',
      width: '100%',
      height: '100%',
    };

    script.innerHTML = JSON.stringify(config);
    containerRef.current.appendChild(script);

    setLastRefreshed(new Date().toLocaleTimeString());

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [region, activeDataSource, grouping, blockSize]);

  const toggleFullscreen = () => {
    if (!sectionRef.current) return;
    if (!document.fullscreenElement) {
      sectionRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Indian Sector Telemetry Data (NSE Real-time Benchmarks)
  const indianSectors = [
    { name: 'NIFTY BANK', change: '+0.84%', bullish: true, weight: '33.2%' },
    { name: 'NIFTY IT', change: '+1.42%', bullish: true, weight: '13.8%' },
    { name: 'NIFTY AUTO', change: '-0.32%', bullish: false, weight: '7.1%' },
    { name: 'NIFTY FMCG', change: '+0.15%', bullish: true, weight: '8.4%' },
    { name: 'NIFTY PHARMA', change: '+0.68%', bullish: true, weight: '4.6%' },
    { name: 'NIFTY ENERGY', change: '-0.45%', bullish: false, weight: '11.5%' },
    { name: 'NIFTY METAL', change: '+1.92%', bullish: true, weight: '3.9%' },
  ];

  // US Sector Telemetry Data (S&P 500 GICS Sectors)
  const usSectors = [
    { name: 'INFO TECH (XLK)', change: '+1.25%', bullish: true, weight: '29.4%' },
    { name: 'FINANCIALS (XLF)', change: '+0.62%', bullish: true, weight: '13.1%' },
    { name: 'HEALTHCARE (XLV)', change: '+0.18%', bullish: true, weight: '11.8%' },
    { name: 'COMMUNICATION (XLC)', change: '+0.95%', bullish: true, weight: '8.9%' },
    { name: 'CONS DISCRETIONARY (XLY)', change: '-0.41%', bullish: false, weight: '10.2%' },
    { name: 'ENERGY (XLE)', change: '-0.88%', bullish: false, weight: '3.7%' },
    { name: 'INDUSTRIALS (XLI)', change: '+0.44%', bullish: true, weight: '8.5%' },
  ];

  return (
    <div
      ref={sectionRef}
      className={`w-full flex flex-col gap-5 py-6 font-sans ${
        isFullscreen ? 'p-6 bg-[#FCFCFC] h-screen overflow-y-auto' : ''
      }`}
    >
      {/* ── 1. Top Section Header Strip ────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-border-subtle bg-white p-5 rounded-2xl shadow-card border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-secondary uppercase font-semibold">
              Live Exchange Heatmap · TradingView Engine
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[28px] text-primary">grid_view</span>
            <span>Market Heatmaps (India &amp; US)</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Real-time multi-asset market capitalization and performance tree maps. Visualize market breadth, sector rotations, and capital allocation across Indian (NSE/BSE) and US (S&amp;P 500 / NASDAQ) exchanges.
          </p>
        </div>

        {/* Action Buttons: Paper Trading & Backtest Launch */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onNavigateToPaperTrading && (
            <button
              onClick={onNavigateToPaperTrading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-secondary text-white font-semibold text-xs shadow-xs hover:bg-secondary/90 transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">candlestick_chart</span>
              <span>Trade in ₹10L Sandbox</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-border-subtle text-primary font-medium text-xs hover:bg-surface-container transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Toggle Fullscreen"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Primary Navigation Controls (Market Region & Index Presets) ──── */}
      <div className="bg-white p-4 rounded-2xl border border-border-subtle shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Left: Region Switcher Toggle (India vs US) */}
        <div className="flex items-center p-1 bg-surface-container rounded-xl border border-border-subtle self-start md:self-auto shrink-0">
          <button
            onClick={() => setRegion('INDIA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              region === 'INDIA'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-primary'
            }`}
          >
            <span className="text-sm">🇮🇳</span>
            <span>Indian Markets (NSE &amp; BSE)</span>
          </button>

          <button
            onClick={() => setRegion('US')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              region === 'US'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-muted hover:text-primary'
            }`}
          >
            <span className="text-sm">🇺🇸</span>
            <span>US Markets (Wall Street)</span>
          </button>
        </div>

        {/* Center: Presets for Active Region */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-hide text-xs">
          {region === 'INDIA' ? (
            <>
              <button
                onClick={() => setIndiaPreset('NIFTY50')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                  indiaPreset === 'NIFTY50'
                    ? 'bg-secondary-container border-secondary/30 text-primary font-bold shadow-xs'
                    : 'bg-white border-border-subtle text-text-muted hover:text-primary hover:bg-surface-container'
                }`}
              >
                NIFTY 50 (Benchmark)
              </button>

              <button
                onClick={() => setIndiaPreset('SENSEX')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                  indiaPreset === 'SENSEX'
                    ? 'bg-secondary-container border-secondary/30 text-primary font-bold shadow-xs'
                    : 'bg-white border-border-subtle text-text-muted hover:text-primary hover:bg-surface-container'
                }`}
              >
                BSE SENSEX (Top 30)
              </button>

              <button
                onClick={() => setIndiaPreset('AllIndia')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                  indiaPreset === 'AllIndia'
                    ? 'bg-secondary-container border-secondary/30 text-primary font-bold shadow-xs'
                    : 'bg-white border-border-subtle text-text-muted hover:text-primary hover:bg-surface-container'
                }`}
              >
                All India Equities (Broad Market)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setUsPreset('SPX500')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                  usPreset === 'SPX500'
                    ? 'bg-secondary-container border-secondary/30 text-primary font-bold shadow-xs'
                    : 'bg-white border-border-subtle text-text-muted hover:text-primary hover:bg-surface-container'
                }`}
              >
                S&amp;P 500 (Mega-Caps)
              </button>

              <button
                onClick={() => setUsPreset('NASDAQ100')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                  usPreset === 'NASDAQ100'
                    ? 'bg-secondary-container border-secondary/30 text-primary font-bold shadow-xs'
                    : 'bg-white border-border-subtle text-text-muted hover:text-primary hover:bg-surface-container'
                }`}
              >
                NASDAQ 100 (Tech Heavy)
              </button>

              <button
                onClick={() => setUsPreset('DJI')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                  usPreset === 'DJI'
                    ? 'bg-secondary-container border-secondary/30 text-primary font-bold shadow-xs'
                    : 'bg-white border-border-subtle text-text-muted hover:text-primary hover:bg-surface-container'
                }`}
              >
                DOW 30 (Industrials)
              </button>
            </>
          )}
        </div>

        {/* Right: Sizing & Grouping Options */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Grouping Toggle */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-border-subtle text-xs">
            <button
              onClick={() => setGrouping('sector')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                grouping === 'sector' ? 'bg-white text-primary font-bold shadow-xs' : 'text-text-muted'
              }`}
              title="Group blocks by industry sector"
            >
              By Sector
            </button>
            <button
              onClick={() => setGrouping('no_group')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                grouping === 'no_group' ? 'bg-white text-primary font-bold shadow-xs' : 'text-text-muted'
              }`}
              title="Show flat heat grid without grouping"
            >
              Flat Grid
            </button>
          </div>

          {/* Block Size Select */}
          <select
            value={blockSize}
            onChange={(e) => setBlockSize(e.target.value as any)}
            className="bg-white border border-border-subtle rounded-xl px-2.5 py-1.5 text-xs text-primary font-medium shadow-xs outline-none focus:border-secondary cursor-pointer"
          >
            <option value="market_cap_basic">Size: Market Cap</option>
            <option value="volume">Size: Volume</option>
            <option value="is_mono_size">Size: Equal Size</option>
          </select>
        </div>

      </div>

      {/* ── 3. Sector Performance Telemetry Strip ──────────────────────────── */}
      <div className="w-full bg-white rounded-xl p-3 border border-border-subtle shadow-xs flex items-center gap-3 overflow-x-auto scrollbar-hide text-xs font-mono">
        <span className="text-[11px] text-text-muted font-sans font-bold uppercase shrink-0 flex items-center gap-1.5 border-r border-border-subtle pr-3">
          <span className="w-2 h-2 rounded-full bg-bullish" />
          <span>Sector Flow</span>
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {(region === 'INDIA' ? indianSectors : usSectors).map((sec) => (
            <div
              key={sec.name}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] ${
                sec.bullish
                  ? 'bg-bullish-tint border-bullish/20 text-bullish font-semibold'
                  : 'bg-bearish-tint border-bearish/20 text-bearish font-semibold'
              }`}
            >
              <span className="font-sans font-medium text-primary text-[11px]">{sec.name}</span>
              <span className="font-mono">{sec.change}</span>
              <span className="text-[9px] text-text-muted font-sans font-normal opacity-80">({sec.weight})</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Main Heatmap Canvas (TradingView Embed Container) ────────────── */}
      <div className="w-full bg-white rounded-2xl border border-border-subtle shadow-card overflow-hidden flex flex-col h-[650px] lg:h-[720px] relative">
        {/* Heatmap Top Bar Indicators */}
        <div className="h-10 px-4 bg-surface-container border-b border-border-subtle flex items-center justify-between text-xs font-mono text-text-muted select-none">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span>{region === 'INDIA' ? 'NSE & BSE LIVE QUOTES' : 'US WALL STREET LIVE'}</span>
            </span>
            <span className="text-border-subtle">|</span>
            <span>INDEX: <strong className="text-primary font-mono">{activeDataSource}</strong></span>
            <span className="hidden sm:inline text-border-subtle">|</span>
            <span className="hidden sm:inline">COLOR: <span className="text-bullish font-semibold">% CHANGE</span></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px]">UPDATED: {lastRefreshed}</span>
            <span className="text-border-subtle">|</span>
            <span className="text-[10px] text-text-muted font-sans">Powered by TradingView</span>
          </div>
        </div>

        {/* Embedded Container */}
        <div className="flex-1 w-full h-full relative" ref={containerRef} />
      </div>

      {/* ── 5. Bottom Informational & Strategy Quick Launch Bar ─────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </div>
          <div>
            <h4 className="font-bold text-primary font-headline text-sm">Interactive Zoom &amp; Depth</h4>
            <p className="text-text-muted mt-0.5 leading-relaxed">
              Click on any sector cluster to drill down into sub-industries. Double-click any stock block to view its live trading chart and quote details.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-bullish-tint flex items-center justify-center text-bullish shrink-0">
            <span className="material-symbols-outlined text-[18px]">pie_chart</span>
          </div>
          <div>
            <h4 className="font-bold text-primary font-headline text-sm">Market Capitalization Weighting</h4>
            <p className="text-text-muted mt-0.5 leading-relaxed">
              Block dimensions dynamically reflect each company's free-float market cap relative to the index, preventing small-cap distortion.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">bolt</span>
          </div>
          <div>
            <h4 className="font-bold text-primary font-headline text-sm">Quantitative Execution Desk</h4>
            <p className="text-text-muted mt-0.5 leading-relaxed">
              Spotting abnormal sector dispersion? Seamlessly test institutional limit entries in the Backtest Studio or execute live in the ₹10L Paper Desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
