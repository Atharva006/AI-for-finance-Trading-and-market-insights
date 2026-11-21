import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Activity,
  Layers,
  FileText,
  Sliders,
  DollarSign,
  Grid,
  ChevronDown,
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Settings,
  Briefcase,
  Search,
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

interface NavGroupItem {
  id: string;
  label: string;
  view?: AppView;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultOpen?: boolean;
  items: NavGroupItem[];
}

export const ArthatixSidebar: React.FC<ArthatixSidebarProps> = ({
  activeView,
  onNavigate,
  isCollapsed,
  onToggleCollapse,
  onOpenSettings,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    market: true,
    quant: true,
    analytics: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const sections: NavSection[] = [
    {
      title: 'Market & Trading',
      icon: BarChart2,
      defaultOpen: true,
      items: [
        { id: 'overview', label: 'Market Overview', view: 'landing' },
        { id: 'papertrading', label: 'Paper Trading Desk', view: 'papertrading', badge: 'Live' },
        { id: 'heatmaps', label: 'Market Heatmaps', view: 'heatmap', badge: 'SENSEX' },
        { id: 'insights', label: 'Fundamental Pulse', view: 'insights' },
      ],
    },
    {
      title: 'Quant & Algos',
      icon: TrendingUp,
      defaultOpen: true,
      items: [
        { id: 'marketplace', label: 'Algo Marketplace', view: 'marketplace' },
        { id: 'backtest', label: 'Backtest Studio', view: 'backtest' },
        { id: 'flow', label: 'Flow Canvas (n8n)', view: 'flow' },
        { id: 'forex', label: 'Asia-London-NY FVG', view: 'forex', badge: 'v5' },
      ],
    },
    {
      title: 'Institutional Audit',
      icon: Shield,
      defaultOpen: false,
      items: [
        { id: 'admin', label: 'Strategy Compiler', view: 'admin' },
      ],
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 bg-[#F4F7FB] border-r border-[#E2E8F0] flex flex-col transition-all duration-200 select-none z-30 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* ── Brand Header ── */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#E2E8F0] bg-[#F4F7FB]">
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer overflow-hidden min-w-0"
          title="Apex Quant"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E40AF] to-[#3B82F6] flex items-center justify-center text-white shadow-xs shrink-0 font-bold text-sm tracking-tighter">
            <span className="text-white">A</span>
          </div>
          {!isCollapsed && (
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-bold text-sm text-[#0F172A] tracking-tight truncate">
                Artho<span className="text-[#2563EB]">tix</span>
              </span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#DBEAFE] text-[#1E40AF] font-semibold">
                Quant
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#E2E8F0] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Navigation Tree ── */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 font-sans text-xs">
        {/* Quick Top Items */}
        <div className="space-y-0.5">
          <button
            onClick={() => onNavigate('landing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
              activeView === 'landing'
                ? 'bg-[#E2E8F0] text-[#0F172A] font-semibold shadow-2xs'
                : 'text-[#475569] hover:bg-[#EAEFF5] hover:text-[#0F172A]'
            }`}
          >
            <Grid className="w-4 h-4 text-[#2563EB] shrink-0" />
            {!isCollapsed && <span className="truncate">Overview</span>}
          </button>
        </div>

        {/* Collapsible Sections */}
        {sections.map((section, sIdx) => {
          const sectionKey = `sec_${sIdx}`;
          const isOpen = openSections[sectionKey] ?? section.defaultOpen ?? true;
          const IconComponent = section.icon;

          return (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(sectionKey)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-[#64748B] hover:text-[#0F172A] tracking-wide rounded-md transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-3.5 h-3.5 text-[#64748B]" />
                    <span>{section.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
                  )}
                </button>
              )}

              {/* Sub-items */}
              {(isOpen || isCollapsed) && (
                <div className={`space-y-0.5 ${!isCollapsed ? 'pl-4 border-l border-[#CBD5E1] ml-4' : ''}`}>
                  {section.items.map((item) => {
                    const isActive = item.view && activeView === item.view;
                    return (
                      <button
                        key={item.id}
                        onClick={() => item.view && onNavigate(item.view)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors text-[11.5px] ${
                          isActive
                            ? 'bg-[#DBEAFE] text-[#1E40AF] font-semibold'
                            : 'text-[#475569] hover:bg-[#EAEFF5] hover:text-[#0F172A]'
                        }`}
                        title={item.label}
                      >
                        <span className="truncate">{item.label}</span>
                        {!isCollapsed && item.badge && (
                          <span
                            className={`text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded ${
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
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[#475569] hover:text-[#0F172A] hover:bg-[#E2E8F0] rounded-lg transition-colors text-left"
          title="Upstox API Gateway"
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
