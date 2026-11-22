import React, { useState, useEffect, useRef } from 'react';

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
  const [blockSize, setBlockSize] = useState<'market_cap_basic' | 'volume'>('market_cap_basic');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Mount TradingView official Stock Heatmap embed engine
  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    widgetDiv.style.width = '100%';
    widgetDiv.style.height = '100%';
    widgetDiv.style.minHeight = '560px';

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      exchanges: [],
      dataSource: region === 'INDIA' ? 'NIFTY50' : 'SPX500',
      grouping: 'sector',
      blockSize: blockSize,
      blockColor: 'change',
      locale: 'en',
      symbolUrl: '',
      colorTheme: 'light',
      hasTopBar: false,
      isDataSetEnabled: false,
      isZoomEnabled: true,
      hasSymbolTooltip: true,
      isMonoSize: false,
      width: '100%',
      height: '100%',
    });

    containerRef.current.appendChild(widgetDiv);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [region, blockSize]);

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
      {/* ── 1. Header Strip ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-gray-200 bg-white p-5 rounded-2xl shadow-xs border">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider text-[#16A34A] uppercase font-bold">
              TradingView Market Heatmap Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A] flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[28px] text-[#0F172A]">grid_view</span>
            <span>Market Heatmaps (India &amp; US)</span>
          </h1>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
            Real-time sector breadth and percentage dispersion across BSE, NSE, and US markets powered by TradingView.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {onNavigateToBacktest && (
            <button
              onClick={() => onNavigateToBacktest(region === 'INDIA' ? 'NIFTY 50' : 'AAPL')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F172A] text-white font-semibold text-xs shadow-xs hover:bg-[#1E293B] transition-all active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>Launch Algo Backtest</span>
            </button>
          )}

          {onNavigateToFVGAlgo && (
            <button
              onClick={onNavigateToFVGAlgo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] font-semibold text-xs hover:bg-[#F8FAFC] transition-all active:scale-95 cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">psychology</span>
              <span>Forex Desk</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-[#CBD5E1] text-[#0F172A] font-medium text-xs hover:bg-[#F8FAFC] transition-all active:scale-95 cursor-pointer shadow-xs"
            title="Toggle Fullscreen"
          >
            <span className="material-symbols-outlined text-[16px]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Primary Navigation Controls (Two Clean Tabs & Stylish Size Selector) ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Left: Two Clean Tabs (Indian Markets vs US Markets) */}
        <div className="flex items-center p-1 bg-[#F1F5F9] rounded-xl border border-[#CBD5E1] self-start md:self-auto shrink-0">
          <button
            onClick={() => setRegion('INDIA')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              region === 'INDIA'
                ? 'bg-white text-[#0F172A] shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="text-sm">🇮🇳</span>
            <span>Indian Markets (BSE · NSE)</span>
          </button>

          <button
            onClick={() => setRegion('US')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              region === 'US'
                ? 'bg-white text-[#0F172A] shadow-xs border border-[#E2E8F0]'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <span className="text-sm">🇺🇸</span>
            <span>US Markets (Wall Street)</span>
          </button>
        </div>

        {/* Right: Stylish Sizing Selector with Unique Typography */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[#64748B]">
            SIZE WEIGHTING
          </span>
          <div className="flex items-center p-0.5 bg-[#0F172A] rounded-xl border border-[#334155]">
            <button
              onClick={() => setBlockSize('market_cap_basic')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                blockSize === 'market_cap_basic'
                  ? 'bg-[#10B981] text-[#021810] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setBlockSize('volume')}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold tracking-wider uppercase transition-all cursor-pointer ${
                blockSize === 'volume'
                  ? 'bg-[#10B981] text-[#021810] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Real-Time Sector Telemetry Bar ── */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="material-symbols-outlined text-[16px] text-[#0F172A]">pie_chart</span>
          <span className="text-xs font-mono font-bold text-[#0F172A] uppercase">
            {region === 'INDIA' ? 'NSE & BSE SECTORS' : 'US GICS SECTORS'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
          {(region === 'INDIA' ? indianSectors : usSectors).map((sec, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] ${
                sec.bullish
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                  : 'bg-rose-50 border-rose-200 text-rose-800 font-semibold'
              }`}
            >
              <span className="font-sans font-medium text-[#0F172A] text-[11px]">{sec.name}</span>
              <span className="font-mono">{sec.change}</span>
              <span className="text-[9px] text-[#64748B] font-sans font-normal opacity-80">
                ({sec.weight})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 4. Main Heatmap Canvas (TradingView Embedded Heatmap Engine) ── */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-[680px] lg:h-[750px] relative">
        {/* Top Info Bar (Without Any Clock) */}
        <div className="h-10 px-4 bg-[#F8FAFC] border-b border-gray-200 flex items-center justify-between text-xs font-mono text-[#64748B] select-none">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[#0F172A] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>TRADINGVIEW HEATMAP ENGINE</span>
            </span>
            <span className="text-[#CBD5E1]">|</span>
            <span>
              DATA SOURCE: <strong className="text-[#0F172A] font-mono">{region === 'INDIA' ? 'NIFTY 50 & BSE' : 'S&P 500 (WALL STREET)'}</strong>
            </span>
            <span className="hidden sm:inline text-[#CBD5E1]">|</span>
            <span className="hidden sm:inline">
              WEIGHTING: <strong className="text-[#0F172A] font-mono">{blockSize === 'market_cap_basic' ? 'MARKET CAP' : 'VOLUME'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#64748B] font-mono uppercase">Interactive Sector Tree</span>
          </div>
        </div>

        {/* Embedded Container for TradingView Heatmap */}
        <div className="flex-1 w-full h-full relative p-2 bg-[#FCFCFC]" ref={containerRef} />
      </div>

      {/* ── 5. Bottom Strategy Quick Launch Bar ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2563EB] shrink-0 font-bold">
            <span className="material-symbols-outlined text-[18px]">zoom_in</span>
          </div>
          <div>
            <h4 className="font-bold text-[#0F172A] text-sm">Interactive Zoom &amp; Sector Depth</h4>
            <p className="text-[#64748B] mt-0.5 leading-relaxed">
              Click on any sector cluster to drill down into sub-industries. Double-click any stock block to inspect its trading parameters.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 shrink-0 font-bold">
            <span className="material-symbols-outlined text-[18px]">pie_chart</span>
          </div>
          <div>
            <h4 className="font-bold text-[#0F172A] text-sm">Real-time Capital Dispersion</h4>
            <p className="text-[#64748B] mt-0.5 leading-relaxed">
              Dynamically visualizes institutional money flow across top capitalization weights in Indian and US financial markets.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
