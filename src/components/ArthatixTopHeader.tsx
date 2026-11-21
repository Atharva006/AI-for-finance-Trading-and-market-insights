import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  User,
  ShieldCheck,
  TrendingUp,
  Activity,
  Maximize2,
  Calendar,
  Layers,
} from 'lucide-react';
import { AppView } from './DhanNavbar';

interface ArthatixTopHeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onOpenSettings: () => void;
  selectedInstrument: string;
  setSelectedInstrument?: (inst: string) => void;
}

export const ArthatixTopHeader: React.FC<ArthatixTopHeaderProps> = ({
  activeView,
  onNavigate,
  onOpenSettings,
  selectedInstrument,
  setSelectedInstrument,
}) => {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-14 w-full bg-[#FFFFFF] border-b border-[#E2E8F0] px-5 flex items-center justify-between gap-4 sticky top-0 z-20 select-none">
      {/* ── Left: Global Search & Current Context ── */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-[#F8FAFC] text-xs transition-all w-full ${
            searchFocused
              ? 'border-[#2563EB] bg-white ring-2 ring-[#2563EB]/10'
              : 'border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
          <input
            type="text"
            placeholder="Search instruments, symbols, or strategies (e.g. NIFTY 50, RELIANCE, FVG)..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full bg-transparent border-none outline-none text-[#0F172A] placeholder-[#94A3B8] text-xs"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#64748B] bg-[#EDF2F7] rounded border border-[#E2E8F0]">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* ── Center: Quick Market Telemetry Pills ── */}
      <div className="hidden lg:flex items-center gap-3 font-sans text-xs">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]">
          <span className="font-semibold text-[#0F172A]">NIFTY 50</span>
          <span className="font-mono font-bold text-[#0F172A]">25,800.60</span>
          <span className="text-[#16A34A] font-mono text-[11px] font-semibold">+0.68%</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]">
          <span className="font-semibold text-[#0F172A]">SENSEX</span>
          <span className="font-mono font-bold text-[#0F172A]">84,544.20</span>
          <span className="text-[#16A34A] font-mono text-[11px] font-semibold">+0.72%</span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0]">
          <span className="font-semibold text-[#64748B]">INDIA VIX</span>
          <span className="font-mono font-semibold text-[#0F172A]">12.45</span>
        </div>
      </div>

      {/* ── Right: Desk Switching & Profile ── */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => onNavigate('papertrading')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
            activeView === 'papertrading'
              ? 'bg-[#2563EB] text-white shadow-sm'
              : 'bg-[#EFF6FF] text-[#1E40AF] border border-[#BFDBFE] hover:bg-[#DBEAFE]'
          }`}
          title="Switch to Virtual Paper Trading Desk"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Paper Desk</span>
        </button>

        <button
          onClick={() => onNavigate('forex')}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeView === 'forex'
              ? 'bg-[#0F172A] text-white shadow-sm'
              : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
          }`}
          title="Asia-London-NY FVG Liquidity Desk"
        >
          <TrendingUp className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>FVG Algo</span>
        </button>

        <div className="h-5 w-px bg-[#E2E8F0] mx-0.5" />

        <button
          onClick={onOpenSettings}
          className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] rounded-lg transition-colors"
          title="Upstox API Gateway"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Avatar Chip */}
        <div className="flex items-center gap-2 pl-1 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-[#1E293B] text-white flex items-center justify-center font-bold text-xs ring-2 ring-[#E2E8F0]">
            A
          </div>
          <span className="hidden md:inline font-semibold text-xs text-[#0F172A]">
            Atharva
          </span>
        </div>
      </div>
    </header>
  );
};
