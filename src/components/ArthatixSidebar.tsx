import React, { useState } from 'react';
import {
  BarChart2,
  LayoutGrid,
  FileText,
  TrendingUp,
  Activity,
  Briefcase,
  GitBranch,
  PieChart,
  ChevronDown,
  ChevronRight,
  Settings,
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
}

interface NavSubItem {
  id: string;
  label: string;
  view?: AppView;
  badge?: string;
  hasSubmenu?: boolean;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  view?: AppView;
  hasSubmenu?: boolean;
  items?: NavSubItem[];
}

export const ArthatixSidebar: React.FC<ArthatixSidebarProps> = ({
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onOpenSettings,
}) => {
  // Independent open state for collapsible groups
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    market_pulse: true,
    quant_systems: true,
    fundamental_research: false,
  });

  const toggleSection = (id: string, defaultView?: AppView) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    if (defaultView && activeView !== defaultView) {
      onNavigate(defaultView);
    }
  };

  // Distinct, non-repeating institutional navigation tree
  const sections: NavSection[] = [
    {
      id: 'market_pulse',
      title: 'Market Pulse',
      icon: BarChart2,
      defaultOpen: true,
      items: [
        { id: 'equity-watchlist', label: 'Equity Watchlist', view: 'backtest' },
        { id: 'intraday-desk', label: 'Intraday Desk', view: 'papertrading', badge: 'Live' },
        { id: 'floorsheet-l2', label: 'Floorsheet L2', view: 'papertrading' },
        { id: 'volume-spikes', label: 'Volume Spikes', view: 'insights' },
        { id: 'active-movers', label: 'Active Movers', view: 'landing' },
      ],
    },
    {
      id: 'sector_heatmaps',
      title: 'Sector Heatmaps',
      icon: LayoutGrid,
      hasSubmenu: true,
      view: 'heatmap',
    },
    {
      id: 'quant_systems',
      title: 'Quantitative Systems',
      icon: TrendingUp,
      defaultOpen: true,
      items: [
        { id: 'strategy-marketplace', label: 'Strategy Marketplace', view: 'marketplace', hasSubmenu: true },
        { id: 'parameter-optimizer', label: 'Parameter Optimizer', view: 'backtest', hasSubmenu: true },
        { id: 'walk-forward-testing', label: 'Walk-Forward Testing', view: 'backtest', hasSubmenu: true },
        { id: 'session-fvg-engine', label: 'Session FVG Engine', view: 'forex', hasSubmenu: true, badge: 'v5' },
      ],
    },
    {
      id: 'fundamental_research',
      title: 'Fundamental Research',
      icon: FileText,
      defaultOpen: false,
      items: [
        { id: 'valuation-metrics', label: 'Valuation Metrics', view: 'insights', hasSubmenu: true },
        { id: 'financial-health', label: 'Financial Health', view: 'insights', hasSubmenu: true },
        { id: 'banking-radar', label: 'Banking Radar', view: 'heatmap', hasSubmenu: true },
        { id: 'corporate-filings', label: 'Corporate Filings', view: 'insights', hasSubmenu: true },
      ],
    },
    {
      id: 'technical_screener',
      title: 'Technical Screener',
      icon: Activity,
      hasSubmenu: true,
      view: 'forex',
    },
    {
      id: 'institutional_funds',
      title: 'Institutional Funds',
      icon: Briefcase,
      hasSubmenu: true,
      view: 'insights',
    },
    {
      id: 'workflow_studio',
      title: 'Workflow Studio',
      icon: GitBranch,
      hasSubmenu: true,
      view: 'flow',
    },
    {
      id: 'broker_clearing',
      title: 'Broker Clearing Flow',
      icon: PieChart,
      hasSubmenu: true,
      view: 'admin',
    },
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
      <div className="flex-1 overflow-y-auto py-2.5 px-3 space-y-1 text-xs">
        {sections.map((section) => {
          const isOpen = openSections[section.id] ?? false;
          const hasChildren = section.items && section.items.length > 0;
          const IconComponent = section.icon;
          const isDirectActive = section.view && activeView === section.view;

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Section Header Button */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleSection(section.id);
                  } else if (section.view) {
                    onNavigate(section.view);
                  }
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all ${
                  isDirectActive && !hasChildren
                    ? 'bg-[#E2E8F0] text-[#0F172A] font-semibold'
                    : 'text-[#334155] hover:bg-[#EAEFF5] hover:text-[#0F172A]'
                }`}
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-label={section.title}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconComponent className="w-4 h-4 text-[#475569] shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium text-[12.5px] truncate text-[#1E293B]">
                      {section.title}
                    </span>
                  )}
                </div>

                {!isCollapsed && (
                  <div className="shrink-0 text-[#94A3B8]">
                    {hasChildren ? (
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isOpen ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>
                )}
              </button>

              {/* Sub-items (with left vertical guideline) */}
              {hasChildren && (isOpen || isCollapsed) && (
                <div
                  className={`space-y-0.5 animate-fade-in ${
                    !isCollapsed ? 'ml-4 pl-3.5 border-l border-[#CBD5E1] my-0.5' : ''
                  }`}
                >
                  {section.items?.map((item) => {
                    const isActive = item.view && activeView === item.view;

                    return (
                      <button
                        key={item.id}
                        onClick={() => item.view && onNavigate(item.view)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left transition-all text-[12px] group ${
                          isActive
                            ? 'bg-[#DBEAFE]/80 text-[#1E40AF] font-semibold'
                            : 'text-[#475569] hover:bg-[#EAEFF5] hover:text-[#0F172A] hover:translate-x-0.5'
                        }`}
                        title={item.label}
                        aria-label={item.label}
                      >
                        <span className="truncate">{item.label}</span>

                        {!isCollapsed && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            {item.badge && (
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
                            {item.hasSubmenu && (
                              <ChevronRight className="w-3 h-3 text-[#94A3B8] group-hover:text-[#475569] transition-colors" />
                            )}
                          </div>
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
