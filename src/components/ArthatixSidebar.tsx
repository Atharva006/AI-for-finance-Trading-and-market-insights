import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Shield,
  Settings,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { AppView } from './DhanNavbar';

interface ArthatixSidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSettings: () => void;
  isAdmin?: boolean;
}

interface NavSubItem {
  id: string;
  label: string;
  view: AppView;
  badge?: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  items: NavSubItem[];
}

export const ArthatixSidebar: React.FC<ArthatixSidebarProps> = ({
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onOpenSettings,
  isAdmin = false,
}) => {
  // Collapsible section state with stable keys
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    market_trading: true,
    quant_algos: true,
    institutional_governance: true,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Exactly 1 canonical entry per view - zero duplicate names or alias redirects
  const sections: NavSection[] = [
    {
      id: 'market_trading',
      title: 'Market & Trading',
      icon: BarChart2,
      defaultOpen: true,
      items: [
        { id: 'landing', label: 'Platform Home', view: 'landing' },
        { id: 'overview', label: 'Market Overview', view: 'overview' },
        { id: 'papertrading', label: 'Paper Trading Desk', view: 'papertrading', badge: 'Live' },
        { id: 'heatmap', label: 'Market Heatmaps', view: 'heatmap' },
        { id: 'insights', label: 'Market Insights', view: 'insights' },
      ],
    },
    {
      id: 'quant_algos',
      title: 'Quant & Algos',
      icon: TrendingUp,
      defaultOpen: true,
      items: [
        { id: 'marketplace', label: 'Algo Marketplace', view: 'marketplace' },
        { id: 'backtest', label: 'Backtest Studio', view: 'backtest' },
        { id: 'forex', label: 'FVG Trading Desk', view: 'forex', badge: 'v5' },
      ],
    },
    ...(isAdmin
      ? [
          {
            id: 'institutional_governance',
            title: 'Institutional Governance',
            icon: Shield,
            defaultOpen: true,
            items: [
              { id: 'admin', label: 'Strategy Compiler', view: 'admin' as AppView },
            ],
          },
        ]
      : []),
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#F4F7FB] border-r border-[#E2E8F0] flex flex-col transition-all duration-200 select-none z-30 shrink-0 font-sans ${
        isCollapsed ? 'w-16' : 'w-60 sm:w-64'
      }`}
    >
      {/* ── Brand Header ── */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#E2E8F0] bg-[#F4F7FB]">
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden min-w-0 group"
          title="Arthatix Platform"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('landing')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E40AF] via-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white shadow-xs shrink-0 font-bold text-sm tracking-tighter">
            <span className="text-white">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-bold text-[15px] text-[#0F172A] tracking-tight truncate">
                Artha<span className="text-[#2563EB]">tix</span>
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors active:scale-95"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation Tree ── */}
      <div className="flex-1 overflow-y-auto py-2.5 px-3 space-y-2 text-xs">
        {sections.map((section) => {
          const isOpen = openSections[section.id] ?? true;
          const IconComponent = section.icon;

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#334155] hover:bg-[#EAEFF5] hover:text-[#0F172A] transition-colors"
                aria-expanded={isOpen}
                aria-label={`Toggle ${section.title}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconComponent className="w-4 h-4 text-[#475569] shrink-0" />
                  {!isCollapsed && (
                    <span className="font-semibold text-[11.5px] uppercase tracking-wider text-[#64748B]">
                      {section.title}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-300 ${
                      isOpen ? 'rotate-0' : '-rotate-90'
                    }`}
                  />
                )}
              </button>

              {/* Canonical Sub-Items (One item per actual view) */}
              {(isOpen || isCollapsed) && (
                <div
                  className={`space-y-0.5 animate-fade-in ${
                    !isCollapsed ? 'ml-3 pl-3 border-l border-[#CBD5E1] my-0.5' : ''
                  }`}
                >
                  {section.items.map((item) => {
                    const isActive = activeView === item.view;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.view)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-all text-[12px] ${
                          isActive
                            ? 'bg-[#DBEAFE] text-[#1E40AF] font-bold border-l-2 border-[#2563EB]'
                            : 'text-[#475569] hover:bg-[#EAEFF5] hover:text-[#0F172A] hover:translate-x-0.5 font-medium'
                        }`}
                        title={item.label}
                        aria-label={item.label}
                      >
                        <span className="truncate">{item.label}</span>

                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              item.badge === 'Live'
                                ? 'bg-[#DCFCE7] text-[#166534]'
                                : 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Bottom Configuration & Status ── */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#F4F7FB] space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors text-left active:scale-95"
          title="Upstox API Gateway"
          aria-label="Open Upstox API Gateway configuration"
        >
          <Settings className="w-4 h-4 text-[#64748B] shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between min-w-0">
              <span className="text-[11.5px] truncate font-medium">Upstox API</span>
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" title="Connected" />
            </div>
          )}
        </button>

        {!isCollapsed && (
          <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] shadow-2xs">
            <div className="flex items-center justify-between text-[10px] text-[#64748B]">
              <span>NSE STREAM</span>
              <span className="text-[#16A34A] font-bold font-mono">12ms · LIVE</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
