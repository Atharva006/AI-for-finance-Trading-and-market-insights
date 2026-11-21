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

  // Synchronize browser history and popstate events
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
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
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-sans selection:bg-primary selection:text-on-primary antialiased">
      {/* High-frequency Quants Live Ticker Header & Nav unified in fixed header */}
      <header className="fixed top-0 w-full z-50">
        <QuantTerminalHeader
          onOpenForex={() => navigateTo('forex')}
          activeView={activeView}
        />
        <DhanNavbar
          activeView={activeView}
          setActiveView={(view) => navigateTo(view)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          selectedInstrument={selectedInstrument}
          setSelectedInstrument={setSelectedInstrument}
        />
      </header>

      {/* Main View Router (pt-24 accounts for the 96px fixed header) */}
      <main className="w-full pt-24 px-margin bg-background flex-1 flex flex-col">
        {activeView === 'landing' && (
          <LandingPage
            onNavigateToView={(view) => navigateTo(view)}
            onSelectStrategy={(id) => {
              const match = strategies.find((s) => s.id === id);
              if (match) {
                navigateTo('detail', match);
              } else {
                navigateTo('marketplace');
              }
            }}
            customStrategies={strategies}
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
            <h2 className="text-xl font-bold text-on-surface">No Strategy Selected</h2>
            <p className="text-sm text-text-muted">Select an audited quantitative strategy from the algorithm marketplace.</p>
            <button
              onClick={() => navigateTo('marketplace')}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md shadow-xs hover:bg-primary-container transition-all"
            >
              Browse Marketplace
            </button>
          </div>
        )}

        {activeView === 'backtest' && (
          <BacktestStudio
            onStrategyUpdated={handleUpdateStrategy}
            initialSymbol={selectedInstrument}
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
      </main>

      {/* Upstox API Settings & Key Manager Modal */}
      <UpstoxSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Footer Minimal Notice (Matching Stitch Exactly) */}
      <footer className="w-full bg-surface-card border-t border-border-subtle px-margin py-space-sm select-none">
        <div className="flex flex-col md:flex-row items-center justify-between gap-space-sm font-mono-sm text-mono-sm text-text-muted">
          <div className="flex items-center gap-space-sm">
            <span className="w-2 h-2 rounded-full bg-bullish" />
            <span>Real Bar-by-Bar Vectorized Quantitative Backtesting</span>
          </div>
          <div>
            Institutional Systematic Strategy Engineering · Multi-Asset Portfolio Allocation
          </div>
          <div>
            Apex Quant Research Workstation
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
