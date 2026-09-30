import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CapabilityItem } from '../types';
import {
  Settings,
  PlusCircle,
  Database,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Cpu,
  Layers
} from 'lucide-react';

export const CustomizePage: React.FC = () => {
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>([]);
  const [capName, setCapName] = useState('');
  const [capDomains, setCapDomains] = useState('');
  const [capDesc, setCapDesc] = useState('');
  const [capTrl, setCapTrl] = useState(8);
  const [isRunning, setIsRunning] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    loadCaps();
  }, []);

  const loadCaps = async () => {
    const data = await api.getCapabilities();
    setCapabilities(data);
  };

  const handleRegisterCap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capName.trim()) return;

    const domainList = capDomains
      .split(',')
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);

    const newCap = await api.addCapability({
      name: capName.trim(),
      domains: domainList.length > 0 ? domainList : ['materials', 'energy'],
      description: capDesc.trim() || 'Internal manufacturing capability platform.',
      trl: capTrl,
      dnp_division: 'R&D Headquarters'
    });

    setCapabilities([...capabilities, newCap]);
    setCapName('');
    setCapDomains('');
    setCapDesc('');
    setToastMsg(`Registered new platform capability: "${newCap.name}"`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleTriggerCycle = async () => {
    setIsRunning(true);
    const res = await api.runLiveUpdate();
    setIsRunning(false);
    setToastMsg(`Live collection cycle finished: ${res.new_signals} new signals ingested!`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-blue-600 text-white px-4 py-3 shadow-lg flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="size-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Customize & Organizational Capabilities
          </h1>
          <p className="text-sm text-[#64748b]">
            Configure internal manufacturing platforms, calibrate semantic embeddings, and review AI engine accuracy.
          </p>
        </div>

        <button
          onClick={handleTriggerCycle}
          disabled={isRunning}
          className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`size-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Collecting & Synthesizing...' : 'Run Live Collection Cycle'}</span>
        </button>
      </div>

      {/* Benchmark Accuracy Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>Engine Accuracy & Evaluation Benchmarks</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500">PRECISION</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">100.0%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Zero false-positive noise</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500">F1-SCORE</span>
            <div className="text-2xl font-black text-emerald-600 font-mono mt-1">85.7%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Harmonic balance</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500">EARLY WARNING LEAD</span>
            <div className="text-2xl font-black text-blue-600 font-mono mt-1">54.5 Days</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Lead-time advantage</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-mono text-slate-500">PROVENANCE TRACE</span>
            <div className="text-2xl font-black text-purple-600 font-mono mt-1">100.0%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct link to primary source</div>
          </div>
        </div>
      </div>

      {/* Register Capability & Capability Store List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Register Platform Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <PlusCircle className="size-4 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">Register Internal Capability</h2>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Register new organizational manufacturing competencies, pilot lines, or material tooling to automatically match incoming external breakthroughs.
          </p>

          <form onSubmit={handleRegisterCap} className="space-y-3.5 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Capability Platform Name:
              </label>
              <input
                type="text"
                value={capName}
                onChange={(e) => setCapName(e.target.value)}
                placeholder="e.g. Solid-State Electrolyte & High-Voltage Separator Line"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 text-slate-900"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Domains (comma-separated):
              </label>
              <input
                type="text"
                value={capDomains}
                onChange={(e) => setCapDomains(e.target.value)}
                placeholder="materials, energy, battery, packaging"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Readiness Level (TRL {capTrl}):
                </label>
                <input
                  type="range"
                  min={1}
                  max={9}
                  value={capTrl}
                  onChange={(e) => setCapTrl(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-end text-xs font-mono font-bold text-blue-600">
                TRL {capTrl} / 9
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Description & Tolerances:
              </label>
              <textarea
                value={capDesc}
                onChange={(e) => setCapDesc(e.target.value)}
                rows={3}
                placeholder="What the platform does and what technical failure modes it is sensitive to..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow"
            >
              Add to Capability Store
            </button>
          </form>
        </div>

        {/* Capability Store List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="size-4 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Active Internal Platforms</h2>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              {capabilities.length} Platforms
            </span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
            {capabilities.map((cap) => (
              <div
                key={cap.id}
                className="rounded-xl border border-slate-200 p-4 space-y-2 bg-slate-50/70 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{cap.name}</h3>
                  {cap.trl && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      TRL {cap.trl}
                    </span>
                  )}
                </div>

                {cap.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {cap.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cap.domains.map((dom) => (
                    <span
                      key={dom}
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"
                    >
                      {dom}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
