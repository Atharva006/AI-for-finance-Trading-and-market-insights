import React, { useState, useEffect } from 'react';
import { ALL_CANONICAL_STRATEGIES } from './services/canonicalStrategies';
import { QuantTerminalHeader } from './components/QuantTerminalHeader';
import { DhanNavbar, AppView } from './components/DhanNavbar';
import { LandingPage } from './components/LandingPage';
import { DhanMarketplace } from './components/DhanMarketplace';
import { DhanStrategyDetail } from './components/DhanStrategyDetail';
import { BacktestStudio } from './components/BacktestStudio';
import { VisualFlowStudio } from './components/VisualFlowStudio';
import { AdminStrategyPortal } from './components/AdminStrategyPortal';
import { UpstoxSettingsModal } from './components/UpstoxSettingsModal';
import { MarketPulseInsights } from './components/MarketPulseInsights';
import { AuthPage } from './components/AuthPage';
import { ForexPortal } from './components/ForexPortal';
import { PaperTradingSection } from './components/PaperTradingSection';
import { TradingViewHeatmapSection } from './components/TradingViewHeatmapSection';
import { ArthatixSidebar } from './components/ArthatixSidebar';
import { ArthatixTopHeader } from './components/ArthatixTopHeader';
import { ArthatixOverviewDashboard } from './components/ArthatixOverviewDashboard';
import { AlgoStrategy } from './types/algoMarketplace';
import {
  getStoredStrategies,
  addStrategy as storeAddStrategy,
  updateStrategy as storeUpdateStrategy,
  deleteStrategy as storeDeleteStrategy,
  saveStrategies,
} from './services/strategyStore';

function getViewFromPath(pathname: string, strategies: AlgoStrategy[]): { view: AppView; strategy: AlgoStrategy | null } {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  
  if (cleanPath === '/' || cleanPath === '') {
    return { view: 'landing', strategy: null };
  }
  if (cleanPath.startsWith('/dashboard') || cleanPath === '/paper-trading' || cleanPath === '/papertrading') {
    return { view: 'papertrading', strategy: null };
  }
  if (cleanPath === '/market-heatmaps' || cleanPath === '/heatmap' || cleanPath === '/heatmaps' || cleanPath === '/market-heatmap') {
    return { view: 'heatmap', strategy: null };
  }
  if (cleanPath === '/trading-algorithms') {
    return { view: 'marketplace', strategy: null };
  }
  if (cleanPath === '/trading-algorithms/backtesting-studio') {
    return { view: 'backtest', strategy: null };
  }
  if (cleanPath === '/trading-algorithms/flow-studio') {
    return { view: 'flow', strategy: null };
  }
  if (cleanPath.startsWith('/trading-algorithms/detail/')) {
    const id = decodeURIComponent(cleanPath.replace('/trading-algorithms/detail/', ''));
    const found = strategies.find(s => s.id === id);
    return { view: 'detail', strategy: found || strategies[0] || null };
  }
  if (cleanPath === '/market-insights') {
    return { view: 'insights', strategy: null };
  }
  if (cleanPath === '/admin') {
    return { view: 'admin', strategy: null };
  }
  if (cleanPath === '/forex' || cleanPath === '/nri-forex-portal') {
    return { view: 'forex', strategy: null };
  }
  if (cleanPath === '/auth' || cleanPath === '/sign-in') {
    return { view: 'auth', strategy: null };
  }
  
  return { view: 'landing', strategy: null };
}

function getPathForView(view: AppView, strategy?: AlgoStrategy | null): string {
  switch (view) {
    case 'landing':
      return '/';
    case 'papertrading':
      return '/dashboard';
    case 'heatmap':
      return '/market-heatmaps';
    case 'marketplace':
      return '/trading-algorithms';
    case 'backtest':
      return '/trading-algorithms/backtesting-studio';
    case 'flow':
      return '/trading-algorithms/flow-studio';
    case 'detail':
      return strategy ? `/trading-algorithms/detail/${encodeURIComponent(strategy.id)}` : '/trading-algorithms';
    case 'insights':
      return '/market-insights';
    case 'admin':
      return '/admin';
    case 'forex':
      return '/forex';
    case 'auth':
      return '/auth';
    default:
      return '/';
  }
}

export function App() {
  const [strategies, setStrategies] = useState<AlgoStrategy[]>(() => {
    return getStoredStrategies();
  });

  const [activeView, setActiveView] = useState<AppView>(() => {
    const initial = getViewFromPath(window.location.pathname, getStoredStrategies());
    return initial.view;
  });

  const [selectedStrategy, setSelectedStrategy] = useState<AlgoStrategy | null>(() => {
    const stored = getStoredStrategies();
    const initial = getViewFromPath(window.location.pathname, stored);
    return initial.strategy || stored[0] || null;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState<string>('NIFTY 50');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Synchronize browser history and popstate events
  useEffect(() => {
    const handlePopState = () => {
      const match = getViewFromPath(window.location.pathname, strategies);
      setActiveView(match.view);
      if (match.strategy) {
        setSelectedStrategy(match.strategy);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [strategies]);

  // Master navigation handler with browser history pushState
  const navigateTo = (view: AppView, strategyOverride?: AlgoStrategy | null, replace = false) => {
    const targetStrategy = strategyOverride !== undefined ? strategyOverride : selectedStrategy;
    if (strategyOverride !== undefined) {
      setSelectedStrategy(strategyOverride);
    }
    setActiveView(view);
    const targetPath = getPathForView(view, targetStrategy);

    if (window.location.pathname !== targetPath) {
      if (replace) {
        window.history.replaceState({ view, strategyId: targetStrategy?.id }, '', targetPath);
      } else {
        window.history.pushState({ view, strategyId: targetStrategy?.id }, '', targetPath);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectStrategy = (strategy: AlgoStrategy) => {
    navigateTo('detail', strategy);
  };

  const handleOpenBacktest = (strategy: AlgoStrategy) => {
    navigateTo('backtest', strategy);
  };

  const handleAddStrategy = (newStrategy: AlgoStrategy) => {
    const updated = storeAddStrategy(newStrategy);
    setStrategies(updated);
    setSelectedStrategy(newStrategy);
  };

  const handleUpdateStrategy = (updatedStrategy: AlgoStrategy) => {
    const updated = storeUpdateStrategy(updatedStrategy);
    setStrategies(updated);
    if (selectedStrategy && selectedStrategy.id === updatedStrategy.id) {
      setSelectedStrategy(updatedStrategy);
    }
  };

  const handleDeleteStrategy = (id: string) => {
    const updated = storeDeleteStrategy(id);
    setStrategies(updated);
    if (selectedStrategy && selectedStrategy.id === id) {
      setSelectedStrategy(updated[0] || null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex font-sans selection:bg-[#2563EB] selection:text-white antialiased">
      {/* ── 1. Minimalist Arthatix Left Sidebar ── */}
      <ArthatixSidebar
        activeView={activeView}
        onNavigate={(view) => navigateTo(view)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* ── 2. Fluid Right Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#F8FAFC]">
        {/* Top Minimal Header */}
        <ArthatixTopHeader
          activeView={activeView}
          onNavigate={(view) => navigateTo(view)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          selectedInstrument={selectedInstrument}
          setSelectedInstrument={setSelectedInstrument}
        />

        {/* Main View Router */}
        <main className={`flex-1 flex flex-col w-full ${activeView === 'papertrading' ? 'p-0' : 'px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3'}`}>
          <div key={activeView} className="animate-view flex-1 flex flex-col w-full">
            {activeView === 'landing' && (
              <ArthatixOverviewDashboard
                onNavigate={(view) => navigateTo(view)}
                onSelectInstrument={(symbol) => {
                  setSelectedInstrument(symbol);
                  navigateTo('backtest');
                }}
              />
            )}

            {/* First-Class Live Paper Trading Desk (Direct simulation - zero landing page) */}
            {activeView === 'papertrading' && (
              <PaperTradingSection />
            )}

            {/* Live TradingView <tv-heatmap> Web Component Section */}
            {activeView === 'heatmap' && (
              <TradingViewHeatmapSection
                onNavigateToBacktest={(symbol) => {
                  if (symbol) setSelectedInstrument(symbol);
                  navigateTo('backtest');
                }}
                onNavigateToFVGAlgo={() => {
                  navigateTo('forex');
                }}
              />
            )}

            {activeView === 'auth' && (
              <AuthPage
                onNavigateHome={() => navigateTo('marketplace')}
                onAuthSuccess={() => navigateTo('marketplace')}
              />
            )}

            {activeView === 'marketplace' && (
              <DhanMarketplace
                strategies={strategies}
                onSelectStrategy={handleSelectStrategy}
                onOpenBacktest={handleOpenBacktest}
                onNavigateToAdmin={() => navigateTo('admin')}
                onNavigateToBacktestWithSymbol={(symbol) => {
                  if (symbol) setSelectedInstrument(symbol);
                  navigateTo('backtest');
                }}
                onNavigateToFVG={() => navigateTo('forex')}
              />
            )}

            {activeView === 'admin' && (
              <AdminStrategyPortal
                strategies={strategies}
                onAddStrategy={handleAddStrategy}
                onUpdateStrategy={handleUpdateStrategy}
                onDeleteStrategy={handleDeleteStrategy}
                onTestBacktest={(strat) => {
                  navigateTo('backtest', strat);
                }}
              />
            )}

            {activeView === 'detail' && selectedStrategy && (
              <DhanStrategyDetail
                strategy={selectedStrategy}
                allStrategies={strategies}
                onSelectStrategy={handleSelectStrategy}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onBack={() => navigateTo('marketplace')}
              />
            )}

            {activeView === 'detail' && !selectedStrategy && (
              <div className="w-full py-16 text-center space-y-4">
                <h2 className="text-xl font-bold text-primary font-headline">No Strategy Selected</h2>
                <p className="text-sm text-text-muted">Select an audited quantitative strategy from the algorithm marketplace.</p>
                <button
                  onClick={() => navigateTo('marketplace')}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md shadow-xs hover:bg-secondary transition-all active:scale-95"
                >
                  Browse Marketplace
                </button>
              </div>
            )}

            {activeView === 'backtest' && (
              <BacktestStudio
                onStrategyUpdated={handleUpdateStrategy}
                initialSymbol={selectedInstrument}
                initialStrategy={selectedStrategy}
              />
            )}

            {activeView === 'flow' && (
              <VisualFlowStudio initialStockSymbol={selectedInstrument} />
            )}

            {activeView === 'insights' && (
              <MarketPulseInsights
                onSelectStockForBacktest={(symbol) => {
                  setSelectedInstrument(symbol);
                  navigateTo('backtest');
                }}
                onOpenFlowWithStock={(symbol) => {
                  setSelectedInstrument(symbol);
                  navigateTo('flow');
                }}
              />
            )}

            {activeView === 'forex' && (
              <ForexPortal
                onBackToMain={() => navigateTo('marketplace')}
              />
            )}
          </div>
        </main>

        {/* Footer Minimal Notice */}
        <footer className="w-full bg-white border-t border-[#E2E8F0] px-4 sm:px-6 py-2.5 select-none mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px] text-[#64748B]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
              <span className="text-[#0F172A] font-semibold">Arthatix Quant Workstation</span>
              <span className="text-[#CBD5E1]">·</span>
              <span>Live Virtual &amp; Algorithmic Desks</span>
            </div>
            <div className="text-center sm:text-right text-[#94A3B8]">
              Institutional Quantitative Engine · Real-time Exchange Feeds
            </div>
          </div>
        </footer>
      </div>

      {/* Upstox API Settings & Key Manager Modal */}
      <UpstoxSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
