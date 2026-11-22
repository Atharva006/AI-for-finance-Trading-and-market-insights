import React, { useState } from 'react';
import {
  BarChart2,
  TrendingUp,
  Shield,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from 'lucide-react';
import { AppView } from './DhanNavbar';

interface ArthatixSidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
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
  isAdmin = false,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    ai_intelligence: true,
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

  const sections: NavSection[] = [
    {
      id: 'ai_intelligence',
      title: 'Conversational AI',
      icon: Sparkles,
      defaultOpen: true,
      items: [
        { id: 'intelligence', label: 'Intelligence', view: 'intelligence' },
      ],
    },
    {
      id: 'market_trading',
      title: 'Market & Trading',
      icon: BarChart2,
      defaultOpen: true,
      items: [
        { id: 'overview', label: 'Platform Home', view: 'overview' },
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
        { id: 'barreplay', label: 'Bar Replay Studio', view: 'barreplay', badge: '15m' },
        { id: 'forex', label: 'NRI Forex Desk', view: 'forex' },
      ],
    },
    ...(isAdmin
      ? [
          {
            id: 'institutional_governance',
            title: 'Governance',
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
          <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
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
          className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors active:scale-95"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5 text-[#2563EB]" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation Tree ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-3 text-xs">
        {sections.map((section) => {
          const isOpen = openSections[section.id] ?? true;
          const IconComponent = section.icon;

          if (isCollapsed) {
            // Minimal collapsed state: icon triggers or opens active view
            const firstItem = section.items[0];
            const hasActive = section.items.some((it) => it.view === activeView);

            return (
              <div key={section.id} className="flex justify-center">
                <button
                  onClick={() => onNavigate(firstItem.view)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    hasActive
                      ? 'bg-[#EFF6FF] text-[#2563EB] font-bold shadow-xs'
                      : 'text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                  title={section.title}
                  aria-label={section.title}
                >
                  <IconComponent className="w-5 h-5" />
                </button>
              </div>
            );
          }

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <IconComponent className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-semibold text-[11px] uppercase tracking-wider text-[#64748B]">
                    {section.title}
                  </span>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${
                    isOpen ? 'rotate-0' : '-rotate-90'
                  }`}
                />
              </button>

              {/* Sub-Items */}
              {isOpen && (
                <div className="space-y-0.5 ml-3 pl-3 border-l border-[#E2E8F0] my-0.5">
                  {section.items.map((item) => {
                    const isActive = activeView === item.view;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onNavigate(item.view)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-all text-[12px] ${
                          isActive
                            ? 'bg-[#EFF6FF] text-[#2563EB] font-bold'
                            : 'text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] font-medium'
                        }`}
                        title={item.label}
                      >
                        <span className="truncate">{item.label}</span>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                              item.badge === 'Live'
                                ? 'bg-[#DCFCE7] text-[#166534]'
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
              )}
            </div>
          );
        })}
      </div>

      {/* ── Minimal Bottom Indicator ── */}
      <div className="p-3 border-t border-[#E2E8F0] bg-[#FFFFFF] flex items-center justify-between text-[11px] text-[#94A3B8] font-mono">
        {!isCollapsed ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
            <span className="text-[#64748B] font-sans font-medium">Alltra Active</span>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
          </div>
        )}
      </div>
    </aside>
  );
};
