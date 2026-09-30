import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { Shimmer } from '../components/Shimmer';
import { CapabilityItem } from '../types';
import { api } from '../services/api';
import {
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export const OperationsPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>([]);
  const [capName, setCapName] = useState('');
  const [capDomains, setCapDomains] = useState('');
  const [capDesc, setCapDesc] = useState('');

  const kpis = [
    { label: 'Signals ingested (30d)', value: '1,284', trend: 12.4, up: true },
    { label: 'Precision', value: '0.91', trend: 3.1, up: true },
    { label: 'F1 score', value: '0.87', trend: 1.6, up: true },
    { label: 'Early-warning lead time', value: '23 d', trend: 2.8, up: false }
  ];

  useEffect(() => {
    loadCapabilities();
  }, []);

  const loadCapabilities = async () => {
    const data = await api.getCapabilities();
    setCapabilities(data);
  };

  const handleRunLiveUpdate = async () => {
    setIsRunning(true);
    await api.runLiveUpdate();
    setIsRunning(false);
  };

  const handleRegisterCapability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capName.trim()) return;

    const domainList = capDomains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    const newCap = await api.addCapability({
      name: capName.trim(),
      domains: domainList.length > 0 ? domainList : ['general'],
      description: capDesc.trim() || 'Internal organizational capability platform.'
    });

    setCapabilities([...capabilities, newCap]);
    setCapName('');
    setCapDomains('');
    setCapDesc('');
  };

  const inputStyle =
    'mt-2 w-full rounded-2xl border border-[#e2eaf2] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 px-4 py-2.5 text-sm outline-none transition-all duration-200 placeholder:text-[#94a3b8] text-[#0f172a] dark:text-white focus:border-[#0284c7]';

  return (
    <div className="space-y-6">
      <Header
        title="Operations & Engine Accuracy"
        subtitle="Run the collection and synthesis cycle, keep the internal capability base current, and track how well the engine separates signal from noise."
      />

      {/* 4 Metric KPI Cards */}
      <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {kpis.map((kpi) => (
          <GlassCard
            key={kpi.label}
            className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-[#e2eaf2] dark:border-slate-800 shadow-sm"
          >
            {isRunning ? (
              <div>
                <Shimmer className="h-9 w-24" />
                <Shimmer className="mt-3 h-3 w-full" />
              </div>
            ) : (
              <div>
                <p className="text-3xl font-extrabold text-[#0f172a] dark:text-white font-mono">
                  {kpi.value}
                </p>
                <p className="micro-label mt-2 text-[#64748b] dark:text-slate-400 font-mono text-xs">
                  {kpi.label}
                </p>
                <p
                  className={`mt-3 flex items-center gap-1 text-xs font-semibold font-mono ${
                    kpi.up ? 'text-[#10b981]' : 'text-[#f59e0b]'
                  }`}
                >
                  {kpi.up ? (
                    <ArrowUpRight className="size-3.5" />
                  ) : (
                    <ArrowDownRight className="size-3.5" />
                  )}
                  <span>{kpi.trend}% vs last cycle</span>
                </p>
              </div>
            )}
          </GlassCard>
        ))}
      </div>

      {/* Run Live Update Action Bar */}
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          onClick={handleRunLiveUpdate}
          disabled={isRunning}
          className={`micro-label rounded-full bg-[#0284c7] px-6 py-3 text-white transition-all duration-200 hover:bg-[#0369a1] active:scale-[0.97] disabled:opacity-70 font-bold font-mono text-xs cursor-pointer shadow-sm ${
            isRunning ? '' : 'pulse-cta'
          }`}
        >
          <span className="flex items-center gap-2">
            <RefreshCw className={`size-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Collecting signals…' : 'Run live update'}</span>
          </span>
        </button>
        <p className="text-sm text-[#64748b] dark:text-slate-400">
          Last cycle completed 4 hours ago · 38 new signals, 6 promoted to dossiers.
        </p>
      </div>

      {/* Register Capability & Capability Base Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Register a Capability Form */}
        <GlassCard
          hover={false}
          className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-[#e2eaf2] dark:border-slate-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">
            Register a capability
          </h2>
          <form onSubmit={handleRegisterCapability} className="mt-4 space-y-3">
            <label className="micro-label text-[#64748b] dark:text-slate-400 font-mono text-xs block">
              Capability name
              <input
                value={capName}
                onChange={(e) => setCapName(e.target.value)}
                placeholder="e.g. Solid-state electrolyte processing"
                className={inputStyle}
                required
              />
            </label>

            <label className="micro-label mt-4 block text-[#64748b] dark:text-slate-400 font-mono text-xs">
              Domains (comma separated)
              <input
                value={capDomains}
                onChange={(e) => setCapDomains(e.target.value)}
                placeholder="materials, energy"
                className={inputStyle}
              />
            </label>

            <label className="micro-label mt-4 block text-[#64748b] dark:text-slate-400 font-mono text-xs">
              Description
              <textarea
                value={capDesc}
                onChange={(e) => setCapDesc(e.target.value)}
                rows={3}
                placeholder="What the platform does and what it is sensitive to…"
                className={inputStyle}
              />
            </label>

            <div className="mt-4 pt-1">
              <button
                type="submit"
                className="micro-label rounded-full bg-[#0284c7] px-5 py-2.5 text-white transition-all duration-200 hover:bg-[#0369a1] active:scale-[0.97] font-bold font-mono text-xs cursor-pointer shadow-sm"
              >
                Add to capability base
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Capability Base List */}
        <GlassCard
          hover={false}
          className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-[#e2eaf2] dark:border-slate-800 shadow-sm"
        >
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">
            Capability base
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {capabilities.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl bg-[#f1f5f9]/70 dark:bg-slate-800/60 p-4 border border-[#e2eaf2]/70 dark:border-slate-700/60"
              >
                <p className="font-semibold text-sm text-[#0f172a] dark:text-white">
                  {item.name}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.domains.map((dom) => (
                    <span
                      key={dom}
                      className="micro-label rounded-full bg-[#e0f2fe] dark:bg-sky-950/50 px-2.5 py-1 text-[#0284c7] dark:text-sky-400 font-mono text-[10px] font-bold"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
};
