import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { GlassCard } from '../components/GlassCard';
import { OpportunityItem } from '../types';
import { api } from '../services/api';
import { Download } from 'lucide-react';

interface SliderControlProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

const SliderControl: React.FC<SliderControlProps> = ({
  label,
  value,
  onChange
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="micro-label text-[#64748b] dark:text-slate-400 font-mono text-xs">
          {label}
        </span>
        <span className="text-sm font-bold text-[#0284c7] font-mono">
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-[#f1f5f9] dark:bg-slate-800 accent-[#0284c7] transition-all duration-200"
      />
    </div>
  );
};

export const CommunicatePage: React.FC = () => {
  const [sourceTrust, setSourceTrust] = useState(88);
  const [techMatch, setTechMatch] = useState(76);
  const [diversity, setDiversity] = useState(64);
  const [noteContent, setNoteContent] = useState('');
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);

  useEffect(() => {
    api.getOpportunities().then(setOpportunities);
  }, []);

  // 45% source trust, 35% technical match, 20% evidence diversity
  const simulatedConfidence = useMemo(() => {
    return Math.round(sourceTrust * 0.45 + techMatch * 0.35 + diversity * 0.20);
  }, [sourceTrust, techMatch, diversity]);

  const handleDownloadBriefing = () => {
    const oppLines = opportunities.map(
      (o) => `- ${o.title} (${o.confidence}%) — lab test: ${o.labTest}`
    );

    const markdownDoc = [
      `# TechIntel Hub — Executive Briefing`,
      ``,
      `Simulated confidence: ${simulatedConfidence}%`,
      `Source trust: ${sourceTrust}% · Technical match: ${techMatch}% · Diversity: ${diversity}%`,
      ``,
      `## Opportunities under review`,
      ...oppLines,
      ``,
      `## Researcher notes`,
      noteContent || `(no notes recorded)`
    ].join('\n');

    const blob = new Blob([markdownDoc], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'techintel-briefing.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Header
        title="Communicate & Test Hypotheses"
        subtitle="Stress-test how an opportunity's confidence responds to its assumptions, log what the lab and partners report back, and export a briefing for leadership."
      />

      {/* Simulator Section Grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
        {/* Sliders Card */}
        <GlassCard className="flex flex-col gap-6 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-[#e2eaf2] dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">
            Confidence sensitivity simulator
          </h2>
          <SliderControl
            label="Source trust"
            value={sourceTrust}
            onChange={setSourceTrust}
          />
          <SliderControl
            label="Technical match"
            value={techMatch}
            onChange={setTechMatch}
          />
          <SliderControl
            label="Evidence diversity"
            value={diversity}
            onChange={setDiversity}
          />
          <p className="text-sm text-[#64748b] dark:text-slate-400">
            Weighted as 45% source trust, 35% technical match, 20% evidence diversity.
          </p>
        </GlassCard>

        {/* Live Simulated Gauge Hero Card */}
        <GlassCard
          hover={false}
          className="grid place-items-center text-center p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-[#e2eaf2] dark:border-slate-800 shadow-sm"
        >
          <div>
            <p className="micro-label text-[#64748b] dark:text-slate-400 font-mono text-xs">
              Simulated confidence
            </p>
            <p className="mt-2 text-6xl font-extrabold text-[#0284c7] font-mono">
              {simulatedConfidence}%
            </p>
            <p className="mt-3 text-sm text-[#64748b] dark:text-slate-400">
              {simulatedConfidence >= 80
                ? 'Strong case — ready to propose for lab testing.'
                : simulatedConfidence >= 60
                ? 'Promising — needs one more weighted source.'
                : 'Hold — evidence base is too thin to act on.'}
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Researcher Notes Log & Download Briefing Card */}
      <GlassCard
        hover={false}
        className="mt-6 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 border border-[#e2eaf2] dark:border-slate-800 shadow-sm"
      >
        <h2 className="text-xl font-bold text-[#0f172a] dark:text-white">
          Researcher notes log
        </h2>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          rows={6}
          placeholder="Meeting notes, sample status, lab results…"
          className="mt-4 w-full rounded-2xl border border-[#e2eaf2] dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 p-4 text-sm outline-none transition-all duration-200 placeholder:text-[#94a3b8] text-[#0f172a] dark:text-white focus:border-[#0284c7]"
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={handleDownloadBriefing}
            className="micro-label rounded-full bg-[#0284c7] px-5 py-2.5 text-white transition-all duration-200 hover:bg-[#0369a1] active:scale-[0.97] font-bold font-mono text-xs cursor-pointer inline-flex items-center gap-2 shadow-sm"
          >
            <Download className="size-3.5" />
            <span>Download briefing</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
