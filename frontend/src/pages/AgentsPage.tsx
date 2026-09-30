import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  Layers,
  FileCode,
  BookOpen,
  Scale,
  ShieldAlert,
  FlaskConical,
  Zap,
  Lightbulb,
  FileText,
  Check,
  CheckCircle2
} from 'lucide-react';
import { INITIAL_AGENTS } from '../data/mockData';
import { AgentItem } from '../types';

export const AgentsPage: React.FC = () => {
  const [agents, setAgents] = useState<AgentItem[]>(INITIAL_AGENTS);
  const [activeDomain, setActiveDomain] = useState('All (19)');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const domainTabs = ['All (19)', 'Engineering', 'IP', 'Life Sciences', 'Materials'];

  const iconMap: Record<string, any> = {
    Sparkles,
    FileText,
    Lightbulb,
    Search,
    Layers,
    ShieldAlert,
    FileCode,
    BookOpen,
    Scale,
    FlaskConical,
    Zap
  };

  const handleToggleAgent = (agentId: string) => {
    setAgents((prev) =>
      prev.map((a) => {
        if (a.id === agentId) {
          const nextState = !a.enabled;
          setToastMsg(
            `Agent "${a.title}" ${nextState ? 'enabled for continuous execution' : 'paused'}`
          );
          setTimeout(() => setToastMsg(null), 3000);
          return { ...a, enabled: nextState };
        }
        return a;
      })
    );
  };

  const filteredAgents = useMemo(() => {
    if (activeDomain.startsWith('All')) return agents;
    return agents.filter((a) => a.category.toLowerCase().includes(activeDomain.toLowerCase()));
  }, [agents, activeDomain]);

  // Group by category for structured sections
  const groupedAgents = useMemo(() => {
    const map: Record<string, AgentItem[]> = {};
    filteredAgents.forEach((a) => {
      if (!map[a.category]) map[a.category] = [];
      map[a.category].push(a);
    });
    return map;
  }, [filteredAgents]);

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-blue-600 text-white px-4 py-3 shadow-lg flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="size-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header matching Screenshot 5 */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Agent
        </h1>
        <p className="text-sm text-[#64748b] max-w-4xl leading-relaxed">
          Powered by our proprietary orchestration engine, Eureka Agents deeply integrate domain expertise, real-time R&D data (IIT/IISc, IPO patents, MeitY policies), and controllable execution to deliver verifiable, expert-level agents for complex research and development workflows.
        </p>
      </div>

      {/* Domain Filter Pills matching Screenshot 5 */}
      <div className="flex flex-wrap gap-2">
        {domainTabs.map((tab) => {
          const isActive = activeDomain === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveDomain(tab)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Grouped Agent Cards Grid matching Screenshot 5 */}
      <div className="space-y-8">
        {Object.entries(groupedAgents).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono">
              {category}
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((agent) => {
                const Icon = iconMap[agent.icon] || Sparkles;
                return (
                  <div
                    key={agent.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Icon + Toggle Switch */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="size-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                          <Icon className="size-4.5" />
                        </div>

                        {/* Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleAgent(agent.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            agent.enabled ? 'bg-blue-600' : 'bg-slate-200'
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              agent.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {agent.title}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        {agent.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Status: {agent.enabled ? 'Continuous Sync' : 'Standby'}</span>
                      <span className="text-blue-600 font-bold hover:underline cursor-pointer">
                        Configure ↗
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
