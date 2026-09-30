import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  ExternalLink,
  Calendar,
  Building2,
  Quote,
  CheckCircle2,
  Lock,
  Filter,
  Layers,
  ArrowUpRight,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { INITIAL_OPPORTUNITIES, SOURCE_CONFIGS } from '../data/mockData';
import { EvidenceSource, OpportunityItem } from '../types';
import { SourceBadge } from '../components/SourceBadge';
import { EvidenceModal } from '../components/EvidenceModal';
import { OfficialPortalsCard } from '../components/OfficialPortalsCard';

export const EvidenceCheckerPage: React.FC = () => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedSourceType, setSelectedSourceType] = useState<string>('All');
  const [selectedOppForModal, setSelectedOppForModal] = useState<OpportunityItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Flatten all evidence dossiers across all opportunities
  const allEvidence = INITIAL_OPPORTUNITIES.flatMap((opp) =>
    (opp.evidenceDossier || []).map((ev) => ({
      ...ev,
      parentOppTitle: opp.title,
      parentOpp: opp
    }))
  );

  const filteredEvidence = allEvidence.filter((ev) => {
    const matchType =
      selectedSourceType === 'All' ||
      ev.source.toLowerCase() === selectedSourceType.toLowerCase();

    const q = searchFilter.trim().toLowerCase();
    const matchQ =
      !q ||
      ev.label.toLowerCase().includes(q) ||
      ev.authority.toLowerCase().includes(q) ||
      ev.verbatimQuote.toLowerCase().includes(q) ||
      (ev.doiOrPatentNo && ev.doiOrPatentNo.toLowerCase().includes(q));

    return matchType && matchQ;
  });

  const handleOpenModal = (opp: OpportunityItem) => {
    setSelectedOppForModal(opp);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn pb-16 max-w-6xl mx-auto">
      <EvidenceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        opportunity={selectedOppForModal}
      />

      {/* Header */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 text-purple-700 dark:text-purple-300 font-bold text-[10.5px] font-mono uppercase tracking-wider">
            Verifiable Provenance & Trust
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
            Audited Evidence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight font-sans">
          Evidence & Trust Checker
        </h1>
        <p className="text-xs sm:text-[13.5px] text-[#64748b] dark:text-slate-400 max-w-3xl leading-relaxed">
          Audit source reliability, verifiable publication dates, issuing patent authorities, and exact verbatim quotes from research papers, patents, and government gazettes.
        </p>
      </div>

      {/* Mathematical Trust Weights Grid (Light Tinted Structured Box Model) */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-4">
        <h2 className="text-xs font-bold uppercase font-mono tracking-wider text-slate-400">
          Source Reliability & Trust Weighting Index
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-4.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
            <span className="text-[10.5px] font-mono text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider block">
              PEER-REVIEWED PAPERS
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono">100%</div>
            <p className="text-[11px] text-slate-500 font-medium truncate">IIT Madras, IISc, Nature</p>
          </div>

          <div className="p-4 sm:p-4.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
            <span className="text-[10.5px] font-mono text-sky-700 dark:text-sky-300 font-bold uppercase tracking-wider block">
              PATENT REGISTRIES
            </span>
            <div className="text-2xl font-extrabold text-sky-600 font-mono">90%</div>
            <p className="text-[11px] text-slate-500 font-medium truncate">IPO India, USPTO, JPO Japan</p>
          </div>

          <div className="p-4 sm:p-4.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
            <span className="text-[10.5px] font-mono text-purple-700 dark:text-purple-300 font-bold uppercase tracking-wider block">
              POLICY DIRECTIVES
            </span>
            <div className="text-2xl font-extrabold text-purple-600 font-mono">85%</div>
            <p className="text-[11px] text-slate-500 font-medium truncate">MeitY circulars, PLI gazettes</p>
          </div>

          <div className="p-4 sm:p-4.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 space-y-1">
            <span className="text-[10.5px] font-mono text-amber-700 dark:text-amber-300 font-bold uppercase tracking-wider block">
              STARTUP & VC DISCLOSURES
            </span>
            <div className="text-2xl font-extrabold text-amber-600 font-mono">65%</div>
            <p className="text-[11px] text-slate-500 font-medium truncate">Disclosed cap tables & filings</p>
          </div>
        </div>
      </div>

      {/* Official Ingestion Portals Status Card */}
      <OfficialPortalsCard />

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs w-full sm:flex-1 shadow-2xs">
          <Search className="size-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search primary quotes, citations, patent numbers, or issuing authorities..."
            className="bg-transparent outline-none w-full text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['All', 'peer-reviewed', 'patent', 'policy', 'startup'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedSourceType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                selectedSourceType === t
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {t === 'peer-reviewed' ? 'Papers' : t === 'patent' ? 'Patents' : t === 'policy' ? 'Policy' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Cards Feed: Vertical Card Stack */}
      <div className="flex flex-col space-y-6 sm:space-y-7">
        {filteredEvidence.map((ev, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-300 dark:hover:border-indigo-800 transition-all duration-200 space-y-4"
          >
            {/* Top Row: Badge, Date, Identifier */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <SourceBadge source={ev.source} />
                <h3 className="font-extrabold text-[15px] sm:text-[16.5px] text-slate-900 dark:text-white tracking-tight">
                  {ev.label}
                </h3>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {ev.publicationDate}
                </span>
                {ev.doiOrPatentNo && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                    {ev.doiOrPatentNo}
                  </span>
                )}
                <span className="text-emerald-600 font-bold font-mono">
                  {ev.confidenceScore}% Weight
                </span>
              </div>
            </div>

            {/* Issuing Authority */}
            <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-600 dark:text-slate-300">
              <Building2 className="size-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-500">Authority:</span>
              <span className="font-medium">{ev.authority}</span>
            </div>

            {/* Verbatim Auditable Quote Box */}
            <div className="rounded-xl bg-slate-50/90 dark:bg-slate-800/60 p-4 sm:p-4.5 border-l-4 border-indigo-500 text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 italic space-y-1 shadow-2xs">
              <p className="flex items-start gap-2.5">
                <Quote className="size-4 text-indigo-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{ev.verbatimQuote}</span>
              </p>
            </div>

            {/* Linked Opportunity & Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs sm:text-[13px]">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Layers className="size-3.5 text-blue-500 shrink-0" />
                <span className="font-medium truncate max-w-md">
                  Matches: <span className="font-bold text-slate-800 dark:text-slate-200">{ev.parentOppTitle}</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenModal(ev.parentOpp)}
                  className="text-xs sm:text-[13px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Inspect Full Dossier</span>
                  <ChevronRight className="size-4 stroke-[2.5]" />
                </button>

                <a
                  href={ev.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                >
                  <span>Open Primary Source</span>
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
