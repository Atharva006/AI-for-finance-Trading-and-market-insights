import React, { useState, useEffect } from 'react';
import { Compass, Sliders, Workflow, Activity, Plus, TrendingUp, User, LogOut, Globe2 } from 'lucide-react';
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
    // Poll or check on view change
    setCurrentUser(getStoredLocalUser());
  }, [activeView]);

  const handleSignOut = async () => {
    await signOutUser();
    setCurrentUser(null);
    setIsAccountMenuOpen(false);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 select-none shadow-xs">
      <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-8">
          <div
            onClick={() => setActiveView('landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Institutional Quantitative Workstation"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0A0A0D] flex items-center justify-center text-white font-bold text-base shadow-sm transition-transform group-hover:scale-105">
              AQ
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-xl text-[#0A0A0D] tracking-tight">
                apex
              </span>
              <span className="text-xs text-gray-500 font-semibold">quant</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => setActiveView('landing')}
              className={`py-4 transition-colors relative flex items-center gap-1.5 ${
                activeView === 'landing'
                  ? 'text-[#0A0A0D] font-bold border-b-2 border-[#0A0A0D]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveView('marketplace')}
              className={`py-4 transition-colors relative flex items-center gap-1.5 ${
                activeView === 'marketplace' || activeView === 'detail'
                  ? 'text-[#0A0A0D] font-bold border-b-2 border-[#0A0A0D]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <span>Trading Algos</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-full font-mono font-bold">
                9 Active
              </span>
            </button>

            <button
              onClick={() => setActiveView('backtest')}
              className={`py-4 transition-colors relative flex items-center gap-1.5 ${
                activeView === 'backtest'
                  ? 'text-[#0A0A0D] font-bold border-b-2 border-[#0A0A0D]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Backtest Studio</span>
              <span className="text-[10px] bg-gray-100 text-[#0A0A0D] px-1.5 py-0.5 rounded-full font-mono font-bold">
                Yahoo Daily
              </span>
            </button>

            <button
              onClick={() => setActiveView('flow')}
              className={`py-4 transition-colors relative flex items-center gap-1.5 ${
                activeView === 'flow'
                  ? 'text-[#0A0A0D] font-bold border-b-2 border-[#0A0A0D]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Workflow className="w-4 h-4 text-emerald-600" />
              <span>Flow Canvas</span>
              <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-full font-mono font-bold">
                n8n Nodes
              </span>
            </button>

            <button
              onClick={() => setActiveView('insights')}
              className={`py-4 transition-colors relative flex items-center gap-1.5 ${
                activeView === 'insights'
                  ? 'text-[#0A0A0D] font-bold border-b-2 border-[#0A0A0D]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Market Insights</span>
            </button>

            <button
              onClick={() => setActiveView('forex')}
              className={`py-4 transition-colors relative flex items-center gap-1.5 ${
                activeView === 'forex'
                  ? 'text-[#0A0A0D] font-bold border-b-2 border-[#0A0A0D]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <Globe2 className="w-4 h-4 text-cyan-600" />
              <span>NRI Forex Desk</span>
              <span className="text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 px-1.5 py-0.5 rounded-full font-mono font-bold">
                EUR/GBP
              </span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`py-4 transition-colors relative flex items-center gap-1.5 ${
                activeView === 'admin'
                  ? 'text-[#0A0A0D] font-bold border-b-2 border-[#0A0A0D]'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              <span>Admin Portal</span>
            </button>
          </nav>
        </div>

        {/* Right: Quick Action Controls & User Account */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('forex')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              activeView === 'forex'
                ? 'bg-cyan-50 text-cyan-900 border-cyan-300 shadow-xs'
                : 'bg-white border-cyan-200/80 text-cyan-800 hover:bg-cyan-50/50'
            }`}
            title="Switch to NRI / Global Currency Trading Desk"
          >
            <Globe2 className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden sm:inline">NRI / Forex Portal</span>
            <span className="sm:hidden">Forex</span>
          </button>

          <button
            onClick={() => setActiveView('marketplace')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'marketplace'
                ? 'bg-gray-100 text-black'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-black'
            }`}
          >
            Algorithms
          </button>

          <button
            onClick={() => setActiveView('backtest')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0A0A0D] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch Backtest</span>
          </button>

          {/* User Profile / Sign In Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-gray-200 hover:border-black transition-all bg-gray-50"
                title={`Signed in as ${currentUser.email}`}
              >
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt="User" className="w-6 h-6 rounded-lg object-cover" />
                ) : (
                  <div className={`w-6 h-6 rounded-lg ${currentUser.role === 'admin' ? 'bg-[#FF5500]' : 'bg-emerald-600'} text-white flex items-center justify-center text-xs font-bold`}>
                    {currentUser.role === 'admin' ? 'A' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
                  </div>
                )}
                <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                  {currentUser.role === 'admin' ? 'Admin' : (currentUser.name || currentUser.email.split('@')[0])}
                </span>
                {currentUser.role === 'admin' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 bg-[#FF5500]/10 text-[#FF5500] font-bold rounded">
                    ADMIN
                  </span>
                )}
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400">Signed in as</p>
                    <p className="text-xs font-bold text-gray-900 truncate font-mono">{currentUser.email}</p>
                    <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${currentUser.role === 'admin' ? 'bg-[#FF5500]/10 text-[#FF5500]' : 'bg-emerald-50 text-emerald-700'}`}>
                      {currentUser.role === 'admin' ? 'System Administrator (Root)' : 'Institutional Tier'}
                    </span>
                  </div>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsAccountMenuOpen(false);
                        setActiveView('admin');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-[#FF5500] font-bold hover:bg-orange-50 flex items-center gap-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Admin Strategy Portal</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setIsAccountMenuOpen(false);
                      setActiveView('auth');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <span>Account Profile</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActiveView('auth')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 hover:border-black text-gray-800 hover:text-black text-xs font-bold transition-all bg-white"
            >
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
