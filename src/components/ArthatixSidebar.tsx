import React from 'react';
import {
  BarChart2,
  TrendingUp,
  Shield,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Activity,
  Layers,
  Compass,
  Sliders,
  PlayCircle,
  Globe,
  Info,
} from 'lucide-react';
import { AppView } from './DhanNavbar';

interface ArthatixSidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isAdmin?: boolean;
}

interface NavItem {
  id: string;
  label: string;
  view: AppView;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const ArthatixSidebar: React.FC<ArthatixSidebarProps> = ({
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  isAdmin = false,
}) => {
  const navItems: NavItem[] = [
    { id: 'intelligence', label: 'AI Intelligence', view: 'intelligence', icon: Sparkles, badge: '4o' },
    { id: 'overview', label: 'Platform Home', view: 'overview', icon: BarChart2 },
    { id: 'papertrading', label: 'Paper Trading Desk', view: 'papertrading', icon: Activity, badge: 'Live' },
    { id: 'heatmap', label: 'Market Heatmaps', view: 'heatmap', icon: Layers },
    { id: 'insights', label: 'Market Insights', view: 'insights', icon: Compass },
    { id: 'marketplace', label: 'Algo Marketplace', view: 'marketplace', icon: TrendingUp },
    { id: 'backtest', label: 'Backtest Studio', view: 'backtest', icon: Sliders },
    { id: 'barreplay', label: 'Bar Replay Studio', view: 'barreplay', icon: PlayCircle, badge: '15m' },
    { id: 'forex', label: 'NRI Forex Desk', view: 'forex', icon: Globe },
    { id: 'about', label: 'About Alltra', view: 'about', icon: Info },
    ...(isAdmin
      ? [
          { id: 'admin', label: 'Strategy Compiler', view: 'admin' as AppView, icon: Shield, badge: 'Admin' },
        ]
      : []),
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col transition-all duration-200 select-none z-30 shrink-0 font-sans ${
        isCollapsed ? 'w-16' : 'w-60 sm:w-64'
      }`}
    >
      {/* ── Brand Header & Toggle ── */}
      <div
        className={`h-14 flex items-center border-b border-[#E2E8F0] bg-[#FFFFFF] ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}
      >
        {!isCollapsed && (
          <div
            onClick={() => onNavigate('overview')}
            className="flex items-center gap-2.5 overflow-hidden min-w-0 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#0F172A] flex items-center justify-center shrink-0">
              <img src="/alltra-logo.png" alt="Alltra" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-[15px] text-[#0F172A] tracking-wider font-mono uppercase truncate">
              ALLTRA
            </span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors active:scale-95 cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5 text-[#2563EB]" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Direct Minimal Navigation List ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1 text-xs">
        {navItems.map((item) => {
          const isActive = activeView === item.view;
          const IconComponent = item.icon;

          if (isCollapsed) {
            return (
              <div key={item.id} className="flex justify-center my-0.5">
                <button
                  onClick={() => onNavigate(item.view)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-bold shadow-xs'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                  title={item.label}
                  aria-label={item.label}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.view)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all text-[13px] cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-bold shadow-2xs'
                  : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] font-medium'
              }`}
              title={item.label}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconComponent
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#2563EB]' : 'text-[#64748B]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    item.badge === 'Live'
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : item.badge === '4o'
                      ? 'bg-[#F3E8FF] text-[#7E22CE]'
                      : 'bg-[#EFF6FF] text-[#2563EB]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Minimal Bottom Footer ── */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] text-[10px] tracking-wide">ALLTRA PLATFORM</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
          </div>
        )}
      </div>
    </aside>
  );
};
