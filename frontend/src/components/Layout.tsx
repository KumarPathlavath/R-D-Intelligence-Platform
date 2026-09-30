import React, { useState, useEffect } from 'react';
import {
  SquarePen,
  Radio,
  Layers,
  ShieldCheck,
  TrendingUp,
  Database,
  Settings,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  HelpCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Clock,
  Zap,
  FileText
} from 'lucide-react';
import { formatISTClock } from '../utils/istTime';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSelectRecentQuery?: (query: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  onSelectRecentQuery
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [istClock, setIstClock] = useState<string>(formatISTClock());

  useEffect(() => {
    const timer = setInterval(() => {
      setIstClock(formatISTClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    {
      id: 'new-task',
      label: 'Intelligence Prompt',
      icon: SquarePen,
      badge: 'Main'
    },
    {
      id: 'radar',
      label: 'Live Tech Radar',
      icon: Radio,
      badge: 'Live'
    },
    {
      id: 'opportunities',
      label: 'Capability-Gap Matches',
      icon: Layers
    },
    {
      id: 'evidence',
      label: 'Evidence & Trust Checker',
      icon: ShieldCheck
    },
    {
      id: 'trends',
      label: 'Trend Visualizer',
      icon: TrendingUp
    },
    {
      id: 'catalog',
      label: 'Signals Catalog',
      icon: Database
    },
    {
      id: 'monthly-reports',
      label: 'Monthly Reports',
      icon: FileText,
      badge: 'Report'
    },
    {
      id: 'capabilities',
      label: 'Capability Base & Accuracy',
      icon: Settings
    }
  ];

  const recentTasks = [
    'ALD Passivation for Tropical Batteries',
    'Sheet Coil Geometry EV Flux Leakage',
    'GaN Power Packaging MeitY Incentives',
    'Continuous Flow Chiral API Synthesis'
  ];

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-[#0a0e1a] text-foreground font-sans">
      {/* Executive Dark Sapphire / Deep Navy Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between shrink-0 bg-[#0f172a] dark:bg-[#080d1a] border-r border-slate-800 text-white transition-all duration-300 z-30 sticky top-0 h-screen ${
          sidebarCollapsed ? 'w-[74px] p-3' : 'w-[260px] p-4'
        }`}
      >
        <div className="flex flex-col gap-5">
          {/* Brand Header */}
          <div className="flex items-center justify-between px-1 pt-1">
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={() => onTabChange('new-task')}
            >
              <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Sparkles className="size-4.5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <span className="font-extrabold text-[14px] tracking-tight block leading-tight text-white truncate">
                    R&D Signal Intelligence
                  </span>
                  <span className="text-[9.5px] text-blue-400 font-mono tracking-wider uppercase block font-bold">
                    Continuous Engine v2.4
                  </span>
                </div>
              )}
            </div>

            {/* Collapse Toggle Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="size-4.5 shrink-0" />
                  {!sidebarCollapsed && (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badge === 'Live'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Recents Section */}
          {!sidebarCollapsed && (
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1 font-mono">
                <span>Recent Queries</span>
                <ChevronRight className="size-3 text-slate-500" />
              </div>
              <div className="space-y-1">
                {recentTasks.map((t, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (onSelectRecentQuery) onSelectRecentQuery(t);
                      onTabChange('new-task');
                    }}
                    className="w-full text-left truncate text-xs text-slate-400 hover:text-white hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Activity className="size-3 shrink-0 text-blue-400" />
                    <span className="truncate">{t}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          {/* Live IST Ticker */}
          {!sidebarCollapsed && (
            <div className="px-2 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400 font-bold">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>IST: {istClock}</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-bold border border-blue-800/60">
                LIVE
              </span>
            </div>
          )}

          {/* User Profile Card */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow">
                R
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    Lead Researcher
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    India-Global Intelligence
                  </div>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <span className="size-2 rounded-full bg-emerald-500" title="Online & Connected" />
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#0f172a] text-white sticky top-0 z-40 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="size-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">R&D Signal Intelligence</span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold block">🇮🇳 {istClock}</span>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-white"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {/* Mobile Nav Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f172a] text-white p-4 space-y-1 z-40 border-b border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive ? 'bg-blue-600 text-white font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic Route Container */}
        <main className="flex-1 p-4 sm:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
