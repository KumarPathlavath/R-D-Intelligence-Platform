import React, { useState, useEffect } from 'react';
import {
  Handshake,
  FlaskConical,
  ShieldCheck,
  Search,
  Layers,
  Sparkles,
  CheckCircle2,
  Filter,
  ArrowUpRight,
  ExternalLink,
  HelpCircle,
  Clock,
  ChevronRight,
  Target,
  Sparkle
} from 'lucide-react';
import { OpportunityItem } from '../types';
import { api } from '../services/api';
import { SourceBadge } from '../components/SourceBadge';
import { EvidenceModal } from '../components/EvidenceModal';

export const OpportunitiesPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [triageMap, setTriageMap] = useState<Record<string, string>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [selectedOppForEvidence, setSelectedOppForEvidence] = useState<OpportunityItem | null>(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  const triageOptions = ['Investigate', 'Approve for POC', 'Archive', 'Dismiss'];
  const divisions = [
    'All',
    'Mobility & Energy Storage Division',
    'Mobility Electronics Division',
    'Semiconductor Products Division',
    'Life Sciences & Healthcare',
    'Packaging & Sustainable Materials'
  ];

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    const data = await api.getOpportunities();
    setOpportunities(data);
    const initialTriage: Record<string, string> = {};
    data.forEach((opp) => {
      if (opp.triageStatus === 'investigating') initialTriage[opp.id] = 'Investigate';
      else if (opp.triageStatus === 'approved_for_poc') initialTriage[opp.id] = 'Approve for POC';
      else if (opp.triageStatus === 'archived') initialTriage[opp.id] = 'Archive';
      else if (opp.triageStatus === 'rejected') initialTriage[opp.id] = 'Dismiss';
      else initialTriage[opp.id] = 'Investigate';
    });
    setTriageMap(initialTriage);
  };

  const handleTriageChange = async (oppId: string, action: string) => {
    setTriageMap((prev) => ({ ...prev, [oppId]: action }));
    const statusPayloadMap: Record<string, string> = {
      'Investigate': 'investigating',
      'Approve for POC': 'approved_for_poc',
      'Archive': 'archived',
      'Dismiss': 'rejected'
    };
    await api.updateTriage(oppId, statusPayloadMap[action] || 'unreviewed');
  };

  const handleOpenEvidence = (opp: OpportunityItem) => {
    setSelectedOppForEvidence(opp);
    setIsEvidenceOpen(true);
  };

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchDiv =
      selectedDivision === 'All' ||
      (opp.division && opp.division.toLowerCase() === selectedDivision.toLowerCase());

    const q = searchFilter.trim().toLowerCase();
    const matchQ =
      !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.capability.toLowerCase().includes(q) ||
      opp.rationale.toLowerCase().includes(q) ||
      (opp.gapDescription && opp.gapDescription.toLowerCase().includes(q));

    return matchDiv && matchQ;
  });

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* Evidence Modal Component */}
      <EvidenceModal
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        opportunity={selectedOppForEvidence}
      />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10.5px] font-mono uppercase tracking-wider border border-blue-200/60">
              Information Connection & Matching
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              Active Capability Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight font-sans">
            Matched R&D Opportunities & Capability Gaps
          </h1>
          <p className="text-xs sm:text-[13.5px] text-[#64748b] dark:text-slate-400 max-w-3xl leading-relaxed">
            AI embedding comparison between incoming external research breakthroughs and internal organizational capabilities.
          </p>
        </div>
      </div>

      {/* Search & Division Filter Controls */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs w-full sm:flex-1 shadow-2xs">
            <Search className="size-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter matched opportunities by keyword, capability, or gap..."
              className="bg-transparent outline-none w-full text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="w-full sm:w-64 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-medium outline-none cursor-pointer"
            >
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Cards Feed: Vertical Stack with Generous Padding & Margins */}
      <div className="flex flex-col space-y-6 sm:space-y-7">
        {filteredOpportunities.map((opp) => {
          const currentTriage = triageMap[opp.id] || 'Investigate';
          return (
            <div
              key={opp.id}
              className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200 space-y-5"
            >
              {/* Top Subheader Row: Badges / Source & Conviction Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {opp.sources.map((src, idx) => (
                    <SourceBadge key={idx} source={src.source} />
                  ))}

                  <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold">
                    {opp.capability}
                  </span>

                  {opp.division && (
                    <span className="text-[11.5px] text-slate-500 font-medium hidden sm:inline">
                      • {opp.division}
                    </span>
                  )}
                </div>

                {/* Clickable Confidence Score Badge */}
                <button
                  type="button"
                  onClick={() => handleOpenEvidence(opp)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
                  title="Click to audit primary quotes, dates, and links"
                >
                  <ShieldCheck className="size-3.5" />
                  <span>{opp.confidence}% Conviction</span>
                  <span className="text-[10.5px] text-emerald-600 underline ml-0.5">
                    View Trust Dossier
                  </span>
                </button>
              </div>

              {/* Opportunity Title & Rationale */}
              <div className="space-y-1.5">
                <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#0f172a] dark:text-white leading-snug tracking-tight">
                  {opp.title}
                </h2>
                <p className="text-xs sm:text-[13.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {opp.rationale}
                </p>
              </div>

              {/* Exact Gap in the Market Highlight Box */}
              {opp.gapDescription && (
                <div className="p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider font-mono text-[10.5px] flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-amber-500" />
                    Exact Capability Gap Identified:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed text-xs sm:text-[13px]">
                    {opp.gapDescription}
                  </p>
                </div>
              )}

              {/* Proposed Partnership & Actionable Lab Test Structured Boxes */}
              <div className="grid gap-4 md:grid-cols-2 pt-1">
                {/* Proposed Partnership Box */}
                <div className="rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-4 sm:p-4.5 space-y-1.5">
                  <p className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold font-mono text-xs uppercase tracking-wider">
                    <Handshake className="size-4 text-emerald-600" />
                    <span>Proposed Partnership</span>
                  </p>
                  <p className="text-xs sm:text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {opp.partnership}
                  </p>
                </div>

                {/* Actionable Lab Test Box */}
                <div className="rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-4 sm:p-4.5 space-y-1.5">
                  <p className="flex items-center gap-2 text-purple-800 dark:text-purple-400 font-bold font-mono text-xs uppercase tracking-wider">
                    <FlaskConical className="size-4 text-purple-600" />
                    <span>Actionable Lab Test & Validation</span>
                  </p>
                  <p className="text-xs sm:text-[12.5px] text-slate-700 dark:text-slate-300 leading-relaxed">
                    {opp.labTest}
                  </p>
                </div>
              </div>

              {/* Triage Status Control Toolbar & Right Action Link */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400 uppercase font-mono tracking-wider">
                    Triage Decision:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {triageOptions.map((opt) => {
                      const isActive = currentTriage === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleTriageChange(opp.id, opt)}
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenEvidence(opp)}
                  className="text-xs sm:text-[13px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Audit Primary Quotes</span>
                  <ChevronRight className="size-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
