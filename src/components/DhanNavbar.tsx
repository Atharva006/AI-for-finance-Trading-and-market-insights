import React, { useState, useEffect } from 'react';
import { getStoredLocalUser, signOutUser, AuthUserProfile } from '../services/supabaseAuth';

export type AppView = 'landing' | 'marketplace' | 'backtest' | 'flow' | 'detail' | 'admin' | 'insights' | 'auth' | 'forex';

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
      return "px-space-sm py-1.5 transition-colors bg-surface-container text-on-surface font-semibold rounded-lg font-label-md text-label-md";
    }
    return "px-space-sm py-1.5 font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors";
  };

  return (
    <div className="h-16 w-full bg-surface-card/90 backdrop-blur-md border-b border-border-subtle px-margin flex items-center justify-between gap-gutter select-none">
      {/* Left: Brand Monogram & Name */}
      <div
        onClick={() => setActiveView('landing')}
        className="flex items-center gap-space-sm shrink-0 cursor-pointer group"
        title="Apex Quant Trading Workstation"
      >
        <img
          alt="Apex Quant AQ Monogram"
          className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
          src="https://lh3.googleusercontent.com/aida/ALJJyrDoYL4wVpXsoYtqmZkmWKJAcBOZgjR6a2u3D7pji-QCA1FXxyW_9ixEsJ_EqdIuHO3VuBvesBLo7yGqHV2rnx4bDVRyJydMU4uix9FmelUPL0wHTmmxuvG0o93CFcfmflbMIqzzl2nTZ59kuk6TnQQHRfFZxYglS5bz_oO3eHrmyLyPCEoju6CiVfP_EVZiFTGDu3oWTnesXXfL-Oyy6PZwXKIks9-rsoY_dLVzalD-vA"
        />
        <span className="font-title-md text-title-md text-on-surface tracking-tight font-bold lowercase">
          apex quant
        </span>
      </div>

        {/* Center: Primary Navigation Tabs (Matching Stitch Exactly) */}
        <nav className="hidden xl:flex items-center gap-space-xs">
          <button
            onClick={() => setActiveView('landing')}
            className={navItemClass('landing')}
          >
            Overview
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
            onClick={() => setActiveView('flow')}
            className={navItemClass('flow')}
          >
            Flow Canvas [n8n Nodes]
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
            onClick={() => setActiveView('forex')}
            className={`hidden sm:inline-flex items-center px-space-md py-1.5 rounded-lg font-label-md text-label-md transition-colors ${
              activeView === 'forex'
                ? 'bg-secondary text-on-secondary border border-secondary shadow-xs'
                : 'bg-forex-tint border border-secondary text-secondary hover:bg-secondary hover:text-on-secondary'
            }`}
          >
            Execution Desk
          </button>

          <button
            onClick={() => setActiveView('backtest')}
            className="inline-flex items-center gap-space-xs px-space-md py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-xs active:scale-95"
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
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-xs shadow-xs hover:ring-2 ring-primary/20 transition-all"
                  title={`Signed in as ${currentUser.email}`}
                >
                  {currentUser.role === 'admin' ? 'A' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
                </button>

                {isAccountMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-surface-card border border-border-subtle shadow-lg p-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-border-subtle">
                      <div className="font-bold text-on-surface truncate">{currentUser.name || 'Quant Trader'}</div>
                      <div className="text-[10px] text-text-muted truncate font-mono">{currentUser.email}</div>
                      <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface-container text-on-surface">
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
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-primary hover:text-on-primary transition-colors"
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
