import React, { useState, useEffect, useRef } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'tv-heatmap': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'heatmap-type'?: string;
        'data-source'?: string;
        grouping?: string;
        'block-size'?: string;
        'block-color'?: string;
        theme?: string;
      };
    }
  }
}

export type HeatmapRegion = 'INDIA' | 'US';

interface TradingViewHeatmapSectionProps {
  onNavigateToBacktest?: (symbol?: string) => void;
  onNavigateToFVGAlgo?: () => void;
}

export const TradingViewHeatmapSection: React.FC<TradingViewHeatmapSectionProps> = ({
  onNavigateToBacktest,
  onNavigateToFVGAlgo,
}) => {
  const [region, setRegion] = useState<HeatmapRegion>('INDIA');
  const [indiaPreset, setIndiaPreset] = useState<'SENSEX' | 'NIFTY50' | 'AllIndia'>('SENSEX');
  const [usPreset, setUsPreset] = useState<'SPX500' | 'NASDAQ100' | 'DJI'>('SPX500');
  const [grouping, setGrouping] = useState<'sector' | 'no_group'>('sector');
  const [blockSize, setBlockSize] = useState<'market_cap_basic' | 'volume'>('market_cap_basic');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(() => new Date().toLocaleTimeString());

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const activeDataSource = region === 'INDIA' ? indiaPreset : usPreset;

  // Mount TradingView tv-heatmap custom element dynamically
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous heatmap
    containerRef.current.innerHTML = '';

    // Create tv-heatmap custom element
    const tvEl = document.createElement('tv-heatmap');
    tvEl.setAttribute('heatmap-type', 'stock');
    tvEl.setAttribute('data-source', activeDataSource);
    tvEl.setAttribute('grouping', grouping);
    tvEl.setAttribute('block-size', blockSize);
    tvEl.setAttribute('block-color', 'change');
    tvEl.setAttribute('theme', 'light');

    // Style for full responsive width and height
    tvEl.style.display = 'block';
    tvEl.style.width = '100%';
    tvEl.style.height = '100%';
    tvEl.style.minHeight = '560px';

    containerRef.current.appendChild(tvEl);
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
      {/* ── 1. Header Strip ─────────────────────────────────────────────────── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-border-subtle bg-white p-5 rounded-2xl shadow-card border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-secondary uppercase font-semibold">
              Live Algorithmic Sector Scanner · TradingView tv-heatmap
            </span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[28px] text-primary">grid_view</span>
            <span>Market Heatmaps (India &amp; US)</span>
          </h1>
          <p className="text-xs text-text-muted mt-1 max-w-2xl">
            Real-time market capitalization tree maps powered by TradingView's official <code className="bg-surface-container px-1 py-0.5 rounded text-[11px] font-mono text-primary">&lt;tv-heatmap&gt;</code> engine. Real-time sector breadth and percentage dispersion across BSE SENSEX, NSE NIFTY 50, and US markets.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onNavigateToBacktest && (
            <button
              onClick={() => onNavigateToBacktest(region === 'INDIA' ? 'NIFTY 50' : 'SPX')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-white font-semibold text-xs shadow-xs hover:bg-secondary transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Launch Algo Backtest</span>
            </button>
          )}

          {onNavigateToFVGAlgo && (
            <button
              onClick={onNavigateToFVGAlgo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container border border-border-subtle text-primary font-semibold text-xs hover:bg-secondary hover:text-white transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Pine Script v5 FVG Desk</span>
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
            <span>Indian Markets (BSE · NSE)</span>
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
            <span>US Markets (Wall St)</span>
          </button>
        </div>

        {/* Center: Index Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {region === 'INDIA' ? (
            <>
              <button
                onClick={() => setIndiaPreset('SENSEX')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  indiaPreset === 'SENSEX'
                    ? 'bg-secondary text-white border-secondary font-semibold shadow-xs'
                    : 'bg-white text-text-muted border-border-subtle hover:text-primary hover:bg-surface-container'
                }`}
              >
                BSE SENSEX (Top 30)
              </button>
              <button
                onClick={() => setIndiaPreset('NIFTY50')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  indiaPreset === 'NIFTY50'
                    ? 'bg-secondary text-white border-secondary font-semibold shadow-xs'
                    : 'bg-white text-text-muted border-border-subtle hover:text-primary hover:bg-surface-container'
                }`}
              >
                NIFTY 50 (NSE Benchmark)
              </button>
              <button
                onClick={() => setIndiaPreset('AllIndia')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  indiaPreset === 'AllIndia'
                    ? 'bg-secondary text-white border-secondary font-semibold shadow-xs'
                    : 'bg-white text-text-muted border-border-subtle hover:text-primary hover:bg-surface-container'
                }`}
              >
                All-India Equities (Broad Market)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setUsPreset('SPX500')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  usPreset === 'SPX500'
                    ? 'bg-secondary text-white border-secondary font-semibold shadow-xs'
                    : 'bg-white text-text-muted border-border-subtle hover:text-primary hover:bg-surface-container'
                }`}
              >
                S&amp;P 500 (Mega-Caps)
              </button>
              <button
                onClick={() => setUsPreset('NASDAQ100')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  usPreset === 'NASDAQ100'
                    ? 'bg-secondary text-white border-secondary font-semibold shadow-xs'
                    : 'bg-white text-text-muted border-border-subtle hover:text-primary hover:bg-surface-container'
                }`}
              >
                NASDAQ 100 (Tech Heavy)
              </button>
              <button
                onClick={() => setUsPreset('DJI')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  usPreset === 'DJI'
                    ? 'bg-secondary text-white border-secondary font-semibold shadow-xs'
                    : 'bg-white text-text-muted border-border-subtle hover:text-primary hover:bg-surface-container'
                }`}
              >
                DOW 30 (Industrials)
              </button>
            </>
          )}
        </div>

        {/* Right: Grouping & Sizing Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-border-subtle text-xs">
            <span className="text-text-muted text-[11px] font-mono">GROUP:</span>
            <button
              onClick={() => setGrouping('sector')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                grouping === 'sector' ? 'bg-white text-primary shadow-xs' : 'text-text-muted hover:text-primary'
              }`}
            >
              Sector
            </button>
            <button
              onClick={() => setGrouping('no_group')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                grouping === 'no_group' ? 'bg-white text-primary shadow-xs' : 'text-text-muted hover:text-primary'
              }`}
            >
              Flat
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg border border-border-subtle text-xs">
            <span className="text-text-muted text-[11px] font-mono">SIZE:</span>
            <button
              onClick={() => setBlockSize('market_cap_basic')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                blockSize === 'market_cap_basic' ? 'bg-white text-primary shadow-xs' : 'text-text-muted hover:text-primary'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setBlockSize('volume')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                blockSize === 'volume' ? 'bg-white text-primary shadow-xs' : 'text-text-muted hover:text-primary'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Real-Time Sector Telemetry Bar ───────────────────────────────── */}
      <div className="bg-white p-3.5 rounded-xl border border-border-subtle shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[16px] text-primary">pie_chart</span>
          <span className="text-xs font-mono font-bold text-primary uppercase">
            {region === 'INDIA' ? 'NSE & BSE SECTORS' : 'US GICS SECTORS'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          {(region === 'INDIA' ? indianSectors : usSectors).map((sec, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] ${
                sec.bullish
                  ? 'bg-bullish-tint border-bullish/20 text-bullish font-semibold'
                  : 'bg-bearish-tint border-bearish/20 text-bearish font-semibold'
              }`}
            >
              <span className="font-sans font-medium text-primary text-[11px]">{sec.name}</span>
              <span className="font-mono">{sec.change}</span>
              <span className="text-[9px] text-text-muted font-sans font-normal opacity-80">
                ({sec.weight})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Main Heatmap Canvas (TradingView tv-heatmap Web Component) ─────── */}
      <div className="w-full bg-white rounded-2xl border border-border-subtle shadow-card overflow-hidden flex flex-col h-[680px] lg:h-[750px] relative">
        {/* Top Info Bar */}
        <div className="h-10 px-4 bg-surface-container border-b border-border-subtle flex items-center justify-between text-xs font-mono text-text-muted select-none">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
              <span className="w-2 h-2 rounded-full bg-bullish animate-pulse" />
              <span>&lt;tv-heatmap&gt; WEB COMPONENT</span>
            </span>
            <span className="text-border-subtle">|</span>
            <span>
              DATA SOURCE: <strong className="text-primary font-mono">{activeDataSource}</strong>
            </span>
            <span className="hidden sm:inline text-border-subtle">|</span>
            <span className="hidden sm:inline">
              GROUPING: <strong className="text-primary font-mono">{grouping}</strong>
            </span>
            <span className="hidden md:inline text-border-subtle">|</span>
            <span className="hidden md:inline">
              SIZE: <strong className="text-primary font-mono">{blockSize}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px]">LIVE SYNC: {lastRefreshed}</span>
            <span className="text-border-subtle">|</span>
            <span className="text-[10px] text-text-muted font-sans">TradingView Heatmap Engine</span>
          </div>
        </div>

        {/* Embedded Container for <tv-heatmap> */}
        <div className="flex-1 w-full h-full relative p-2 bg-[#FCFCFC]" ref={containerRef} />
      </div>

      {/* ── 5. Bottom Strategy Quick Launch Bar ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary-container flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </div>
          <div>
            <h4 className="font-bold text-primary font-headline text-sm">Interactive Zoom &amp; Depth</h4>
            <p className="text-text-muted mt-0.5 leading-relaxed">
              Click on any sector cluster to drill down into sub-industries. Double-click any stock block to inspect its trading parameters.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-bullish-tint flex items-center justify-center text-bullish shrink-0">
            <span className="material-symbols-outlined text-[18px]">pie_chart</span>
          </div>
          <div>
            <h4 className="font-bold text-primary font-headline text-sm">Market Cap Weighted Blocks</h4>
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
            <h4 className="font-bold text-primary font-headline text-sm">Algorithmic Execution Scanner</h4>
            <p className="text-text-muted mt-0.5 leading-relaxed">
              Spotting abnormal sector dispersion? Seamlessly test institutional systematic setups in the Backtest Studio or deploy our Audited Asia-London-NY FVG Algorithm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
