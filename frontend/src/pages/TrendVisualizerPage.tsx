import React, { useState } from 'react';
import {
  TrendingUp,
  LineChart,
  Layers,
  Sparkles,
  Zap,
  ExternalLink,
  Calendar,
  ChevronRight,
  Info,
  Filter,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { INITIAL_TREND_DATA, SOURCE_CONFIGS } from '../data/mockData';
import { TrendDataPoint, TrendSpikeTrigger } from '../types';
import { SourceBadge } from '../components/SourceBadge';

export const TrendVisualizerPage: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3M' | '6M' | '1Y'>('6M');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [activeSpikeData, setActiveSpikeData] = useState<TrendDataPoint | null>(
    INITIAL_TREND_DATA.find((t) => t.isSpike) || null
  );

  const domains = [
    'All',
    'Energy Storage & Materials',
    'Packaging & Sustainable Materials',
    'Wide-Bandgap Semiconductors & GaN',
    'Battery Passivation & Tropical Storage'
  ];

  const chartPoints = [
    { month: 'Apr 2026', count: 14, domain: 'Energy Storage & Materials' },
    { month: 'May 2026', count: 19, domain: 'Energy Storage & Materials' },
    { month: 'Jun 2026', count: 22, domain: 'Energy Storage & Materials' },
    { month: 'Jul 2026', count: 27, domain: 'Energy Storage & Materials' },
    {
      month: 'Aug 2026',
      count: 48,
      domain: 'Packaging & Sustainable Materials',
      isSpike: true,
      spikeLabel: 'Packaging Spike (+118%)',
      data: INITIAL_TREND_DATA.find((t) => t.month === 'Aug 2026')
    },
    {
      month: 'Sep 2026',
      count: 56,
      domain: 'Wide-Bandgap Semiconductors & GaN',
      isSpike: true,
      spikeLabel: 'Semiconductors Spike (+142%)',
      data: INITIAL_TREND_DATA.find((t) => t.domain.includes('Semiconductors'))
    }
  ];

  const bubbleClusters = [
    {
      name: 'Power Electronics & GaN Packaging',
      size: '56 Signals',
      growth: '+142%',
      color: 'bg-blue-600 text-white',
      ring: 'border-blue-400',
      spike: true,
      data: INITIAL_TREND_DATA.find((t) => t.domain.includes('Semiconductors'))
    },
    {
      name: 'Compostable Barrier Films',
      size: '48 Signals',
      growth: '+118%',
      color: 'bg-emerald-600 text-white',
      ring: 'border-emerald-400',
      spike: true,
      data: INITIAL_TREND_DATA.find((t) => t.month === 'Aug 2026')
    },
    {
      name: 'ALD Battery Passivation',
      size: '42 Signals',
      growth: '+75%',
      color: 'bg-purple-600 text-white',
      ring: 'border-purple-400',
      spike: true,
      data: INITIAL_TREND_DATA.find((t) => t.domain.includes('Tropical'))
    },
    {
      name: 'Wireless Power Transfer (WPT)',
      size: '31 Signals',
      growth: '+44%',
      color: 'bg-sky-600 text-white',
      ring: 'border-sky-400',
      spike: false
    },
    {
      name: 'Flow-Reactor Chiral Synthesis',
      size: '24 Signals',
      growth: '+32%',
      color: 'bg-amber-600 text-white',
      ring: 'border-amber-400',
      spike: false
    }
  ];

  const maxVal = Math.max(...chartPoints.map((p) => p.count));

  const handlePointClick = (point: typeof chartPoints[0]) => {
    if (point.data) {
      setActiveSpikeData(point.data);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 text-blue-700 dark:text-blue-300 font-bold text-[10.5px] font-mono uppercase tracking-wider">
              Horizon Analytics & Trends
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Continuous 6-Month Trajectory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight font-sans">
            Technology Trend Visualizer
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#64748b] dark:text-slate-400 max-w-2xl leading-relaxed">
            Identify emerging patterns across patent registries, academic literature, and policy gazettes. Click on any spike in the curve to uncover the underlying driving articles.
          </p>
        </div>

        {/* Timeframe Filter Buttons */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shrink-0 self-start sm:self-auto shadow-2xs">
          {(['3M', '6M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTimeframe === tf
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Line Chart Card */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <LineChart className="size-5 text-indigo-600" />
            <h2 className="font-extrabold text-[16.5px] text-slate-900 dark:text-white tracking-tight">
              Signal Velocity & Breakout Spikes
            </h2>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Click on any <span className="font-bold text-indigo-600">Spike Point (●)</span> to inspect root causes
          </div>
        </div>

        {/* Visual Interactive SVG Line Chart */}
        <div className="relative pt-6 pb-2">
          <div className="h-64 w-full flex items-end justify-between gap-4 px-4 sm:px-12 relative">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 border-b border-slate-200 dark:border-slate-800">
              <div className="border-b border-dashed border-slate-300 w-full" />
              <div className="border-b border-dashed border-slate-300 w-full" />
              <div className="border-b border-dashed border-slate-300 w-full" />
              <div className="border-b border-dashed border-slate-300 w-full" />
            </div>

            {/* Line Chart Bars / Points */}
            {chartPoints.map((pt, idx) => {
              const heightPercent = Math.max(15, (pt.count / maxVal) * 85);
              const isSelected = activeSpikeData?.month === pt.month;
              return (
                <div
                  key={idx}
                  onClick={() => handlePointClick(pt)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer z-10"
                >
                  {/* Spike Tooltip Label */}
                  {pt.isSpike && (
                    <div className="absolute -top-3.5 z-20 whitespace-nowrap px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-mono text-[10px] font-bold shadow-md animate-bounce">
                      {pt.spikeLabel}
                    </div>
                  )}

                  {/* Node Dot / Bar Column */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 flex flex-col items-center justify-start p-1.5 ${
                      pt.isSpike
                        ? 'bg-gradient-to-t from-indigo-600 to-sky-400 text-white shadow-md ring-2 ring-indigo-300 ring-offset-2'
                        : isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <span className="text-[11px] font-mono font-bold">{pt.count}</span>
                  </div>

                  {/* Month Label */}
                  <span className="text-[11px] font-mono font-semibold text-slate-500 mt-2">
                    {pt.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Spike Root-Cause Intelligence Box (Light Tinted Structured Box Model) */}
        {activeSpikeData && (
          <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 dark:border-indigo-900/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="size-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                  ⚡
                </span>
                <div>
                  <h3 className="font-extrabold text-[15px] text-slate-900 dark:text-white">
                    Spike Root-Cause Analysis: {activeSpikeData.domain} ({activeSpikeData.month})
                  </h3>
                  <span className="text-xs text-indigo-700 dark:text-indigo-300 font-mono font-bold">
                    Velocity Growth: +{activeSpikeData.growthRate}% over previous baseline
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-mono bg-white dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800 px-3 py-1 rounded-full font-bold self-start sm:self-auto shadow-2xs">
                {activeSpikeData.signalCount} Corroborating Signals
              </span>
            </div>

            {/* Spike Narrative */}
            {activeSpikeData.spikeReason && (
              <p className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                {activeSpikeData.spikeReason}
              </p>
            )}

            {/* Underlying Trigger Articles List */}
            {activeSpikeData.triggerArticles && (
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400">
                  Underlying Articles & Patents That Caused This Spike:
                </h4>

                <div className="grid gap-3.5 md:grid-cols-2">
                  {activeSpikeData.triggerArticles.map((art) => (
                    <div
                      key={art.id}
                      className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <SourceBadge source={art.source} />
                        <span className="text-[10.5px] font-mono text-slate-400">
                          {art.date}
                        </span>
                      </div>

                      <h5 className="font-bold text-xs sm:text-[13px] text-slate-900 dark:text-white leading-snug">
                        {art.title}
                      </h5>

                      <p className="text-[11.5px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {art.snippet}
                      </p>

                      <div className="flex items-center justify-between pt-1.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500 font-mono font-medium truncate max-w-[180px]">
                          {art.origin}
                        </span>
                        <a
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-bold inline-flex items-center gap-1 shrink-0"
                        >
                          <span>View Item</span>
                          <ArrowUpRight className="size-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bubble Clusters / Domain Momentum Section */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-indigo-600" />
            <h2 className="font-extrabold text-[16.5px] text-slate-900 dark:text-white tracking-tight">
              Domain Momentum & Breakthrough Clusters
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            3–6 Month Relative Acceleration
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 pt-2">
          {bubbleClusters.map((cluster, idx) => (
            <div
              key={idx}
              onClick={() => {
                if (cluster.data) setActiveSpikeData(cluster.data);
              }}
              className={`rounded-xl border p-4 flex flex-col justify-between space-y-3 cursor-pointer transition-all hover:scale-[1.01] ${
                cluster.spike
                  ? 'border-indigo-200 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white truncate">
                  {cluster.name}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  {cluster.growth}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-400 font-mono">
                  {cluster.size}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <span>Explore Cluster</span>
                  <ChevronRight className="size-3.5 stroke-[2.5]" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
