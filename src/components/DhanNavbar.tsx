import React, { useState, useEffect } from 'react';
import { getStoredLocalUser, signOutUser, AuthUserProfile } from '../services/supabaseAuth';

export type AppView = 'landing' | 'overview' | 'papertrading' | 'heatmap' | 'marketplace' | 'backtest' | 'flow' | 'detail' | 'admin' | 'insights' | 'auth' | 'forex' | 'barreplay';

interface DhanNavbarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  onOpenSettings?: () => void;
  selectedInstrument?: string;
  setSelectedInstrument?: (inst: string) => void;
}

export const DhanNavbar: React.FC<DhanNavbarProps> = ({
  activeView,
  setActiveView,
}) => {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(() => getStoredLocalUser());
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getStoredLocalUser());
  }, [activeView]);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setIsAccountMenuOpen(false);
  };

  const navItemClass = (view: AppView, matchSecondary?: boolean) => {
    const isActive = activeView === view || (matchSecondary && (activeView === 'detail' || activeView === 'marketplace'));
    if (isActive) {
      return "px-space-sm py-1.5 transition-colors bg-secondary-container text-primary font-semibold rounded-lg font-label-md text-label-md border border-border-subtle shadow-xs";
    }
    return "px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors rounded-lg";
  };

  return (
    <div className="h-16 w-full bg-white/95 backdrop-blur-md border-b border-border-subtle px-margin flex items-center justify-between gap-gutter select-none font-sans">
      {/* Left: Brand Monogram & Name */}
      <div
        onClick={() => setActiveView('landing')}
        className="flex items-center gap-space-sm shrink-0 cursor-pointer group"
        title="Apex Quant Trading Workstation"
      >
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center p-1.5 shadow-xs group-hover:bg-secondary transition-colors">
          <img
            alt="Apex Quant AQ Monogram"
            className="h-full w-full object-contain brightness-0 invert"
            src="https://lh3.googleusercontent.com/aida/ALJJyrDoYL4wVpXsoYtqmZkmWKJAcBOZgjR6a2u3D7pji-QCA1FXxyW_9ixEsJ_EqdIuHO3VuBvesBLo7yGqHV2rnx4bDVRyJydMU4uix9FmelUPL0wHTmmxuvG0o93CFcfmflbMIqzzl2nTZ59kuk6TnQQHRfFZxYglS5bz_oO3eHrmyLyPCEoju6CiVfP_EVZiFTGDu3oWTnesXXfL-Oyy6PZwXKIks9-rsoY_dLVzalD-vA"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-headline font-bold text-base text-primary tracking-tight">
            apex quant
          </span>
          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-text-muted">
            Trading Workstation
          </span>
        </div>
      </div>

      {/* Center: Primary Algorithmic Trading Navigation */}
      <nav className="hidden xl:flex items-center gap-space-xs">
        <button
          onClick={() => setActiveView('landing')}
          className={navItemClass('landing')}
        >
          Overview
        </button>

        {/* Algo Marketplace (Trading & Investing Systematic Models) */}
        <button
          onClick={() => setActiveView('marketplace')}
          className={navItemClass('marketplace')}
        >
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span>Algo Marketplace</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-border-subtle">
              Algos
            </span>
          </span>
        </button>

        {/* TradingView Market Heatmaps (<tv-heatmap> Web Component) */}
        <button
          onClick={() => setActiveView('heatmap')}
          className={navItemClass('heatmap')}
        >
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span>Market Heatmaps</span>
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-bullish/10 text-bullish border border-bullish/25">
              SENSEX · US
            </span>
          </span>
        </button>

        <button
          onClick={() => setActiveView('forex')}
          className={navItemClass('forex', true)}
        >
          Asia-London-NY FVG [Pine Script v5]
        </button>

        <button
          onClick={() => setActiveView('backtest')}
          className={navItemClass('backtest')}
        >
          Backtest Studio [Live Feeds]
        </button>

        <button
          onClick={() => setActiveView('insights')}
          className={navItemClass('insights')}
        >
          Market Insights
        </button>
      </nav>

      {/* Right: Action Buttons & User Profile */}
      <div className="flex items-center gap-space-sm shrink-0">
        <button
          onClick={() => setActiveView('papertrading')}
          className={`inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
            activeView === 'papertrading'
              ? 'bg-secondary text-white shadow-xs'
              : 'bg-secondary-container text-primary hover:bg-secondary hover:text-white border border-border-subtle'
          }`}
          title="Direct Access to ₹10,00,000 Live Virtual Trading Desk"
        >
          <span className="material-symbols-outlined text-[16px]">candlestick_chart</span>
          <span>Paper Desk</span>
        </button>

        <button
          onClick={() => setActiveView('forex')}
          className={`hidden sm:inline-flex items-center px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
            activeView === 'forex'
              ? 'bg-primary text-white shadow-xs'
              : 'bg-surface-container border border-border-subtle text-primary hover:bg-primary hover:text-white'
          }`}
        >
          Execution Desk
        </button>

        <button
          onClick={() => setActiveView('backtest')}
          className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary text-white font-label-md text-label-md hover:bg-secondary transition-colors shadow-xs active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          <span>Launch Backtest</span>
        </button>

        {/* User Profile / Account Menu */}
        <div className="relative pl-space-sm border-l border-border-subtle">
          {currentUser ? (
            <div>
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shadow-xs hover:ring-2 ring-primary/20 transition-all"
                title={`Signed in as ${currentUser.email}`}
              >
                {currentUser.role === 'admin' ? 'A' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-border-subtle shadow-lg p-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-border-subtle">
                    <div className="font-bold text-primary truncate">{currentUser.name || 'Quant Trader'}</div>
                    <div className="text-[10px] text-text-muted truncate font-mono">{currentUser.email}</div>
                    <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-primary">
                      {currentUser.role === 'admin' ? 'ADMIN' : 'QUANT TRADER'}
                    </span>
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-error-container/20 rounded-lg transition-colors font-medium text-left mt-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveView('auth')}
              className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
              title="Sign In"
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
