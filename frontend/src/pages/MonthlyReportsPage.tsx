import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Edit3,
  RefreshCw,
  Download,
  Printer,
  ChevronRight,
  Building2,
  GraduationCap,
  Scale,
  Award,
  AlertCircle,
  HelpCircle,
  BarChart3,
  Network,
  Share2,
  ArrowRight,
  Clock,
  Check,
  SlidersHorizontal,
  FileCheck,
  Search,
  Filter,
  Info
} from "lucide-react";
import { api } from "../services/api";
import {
  MonthlyReportData,
  MonthOption,
  TechnologyGapItem,
  MonthlyRDOpportunity,
  EmergingTechnologySignal,
  SourceEvidence,
  MonthComparisonData
} from "../types";

export const MonthlyReportsPage: React.FC = () => {
  const [availableMonths, setAvailableMonths] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-09");
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>("executive_summary");

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [selectedInsight, setSelectedInsight] = useState<TechnologyGapItem | MonthlyRDOpportunity | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [editContent, setEditContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>("");

  // Comparison Modal State
  const [compareModalOpen, setCompareModalOpen] = useState<boolean>(false);
  const [compareMonth2, setCompareMonth2] = useState<string>("2026-08");
  const [comparisonData, setComparisonData] = useState<MonthComparisonData | null>(null);
  const [comparingLoading, setComparingLoading] = useState<boolean>(false);

  // Filter state for landscape / evidence
  const [evidenceSearch, setEvidenceSearch] = useState<string>("");

  // Load available months
  useEffect(() => {
    loadMonths();
  }, []);

  const loadMonths = async () => {
    try {
      const months = await api.getAvailableMonthlyReports();
      setAvailableMonths(months);
      if (months.length > 0 && !months.some(m => m.year_month === selectedMonth)) {
        setSelectedMonth(months[0].year_month);
      }
    } catch (e) {
      console.error("Failed to load months:", e);
    }
  };

  // Load report data when selectedMonth changes
  useEffect(() => {
    if (selectedMonth) {
      loadReport(selectedMonth, false);
    }
  }, [selectedMonth]);

  const loadReport = async (ym: string, force: boolean = false) => {
    setLoading(true);
    try {
      const data = force
        ? await api.generateMonthlyReport(ym, true)
        : await api.getMonthlyReport(ym);
      setReportData(data);
    } catch (e) {
      console.error("Error fetching report:", e);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    await loadReport(selectedMonth, true);
  };

  const handleOpenReview = (item: TechnologyGapItem | MonthlyRDOpportunity) => {
    setSelectedInsight(item);
    setReviewNotes(("reviewer_notes" in item ? item.reviewer_notes : "") || "");
    setEditContent("potential_gap" in item ? item.potential_gap : (item as MonthlyRDOpportunity).problem);
    setIsEditing(false);
    setReviewSuccessMsg("");
    setReviewModalOpen(true);
  };

  const handleReviewAction = async (action: "approve" | "reject" | "edit") => {
    if (!selectedInsight) return;
    const id = "gap_id" in selectedInsight ? selectedInsight.gap_id : selectedInsight.opportunity_id;
    const newStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "edited";
    
    try {
      await api.reviewReportInsight(
        id,
        action,
        newStatus,
        reviewNotes,
        isEditing ? editContent : undefined
      );

      setReviewSuccessMsg("Insight reviewed successfully!");
      // Update local state
      if (reportData) {
        if ("gap_id" in selectedInsight) {
          setReportData({
            ...reportData,
            technology_gaps: reportData.technology_gaps.map(g =>
              g.gap_id === id
                ? { ...g, validation_status: newStatus as any, reviewer_notes: reviewNotes, potential_gap: isEditing ? editContent : g.potential_gap }
                : g
            )
          });
        } else {
          setReportData({
            ...reportData,
            rd_opportunities: reportData.rd_opportunities.map(o =>
              o.opportunity_id === id
                ? { ...o, review_status: newStatus as any, problem: isEditing ? editContent : o.problem }
                : o
            )
          });
        }
      }
      setTimeout(() => {
        setReviewModalOpen(false);
      }, 1200);
    } catch (e) {
      console.error("Failed to submit review:", e);
    }
  };

  const handleOpenComparison = async () => {
    setCompareModalOpen(true);
    setComparingLoading(true);
    try {
      const data = await api.compareMonths(selectedMonth, compareMonth2);
      setComparisonData(data);
    } catch (e) {
      console.error("Failed to compare months:", e);
    } finally {
      setComparingLoading(false);
    }
  };

  const handleCompareMonthChange = async (m2: string) => {
    setCompareMonth2(m2);
    setComparingLoading(true);
    try {
      const data = await api.compareMonths(selectedMonth, m2);
      setComparisonData(data);
    } catch (e) {
      console.error("Failed to compare months:", e);
    } finally {
      setComparingLoading(false);
    }
  };

  const handleExportCSV = () => {
    const url = api.getExportCSVUrl(selectedMonth);
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  const sectionsList = [
    { id: "executive_summary", num: 1, label: "Executive Summary" },
    { id: "what_changed", num: 2, label: "What Changed?" },
    { id: "emerging_signals", num: 3, label: "Emerging Tech Signals" },
    { id: "research_developments", num: 4, label: "Research Breakthroughs" },
    { id: "patent_developments", num: 5, label: "Patent Registrations" },
    { id: "company_startup_developments", num: 6, label: "Companies & Startups" },
    { id: "market_developments", num: 7, label: "Market Dynamics" },
    { id: "policy_developments", num: 8, label: "Policy & Standards" },
    { id: "technology_gaps", num: 9, label: "Technology Gaps" },
    { id: "rd_opportunities", num: 10, label: "R&D Opportunities" },
    { id: "technology_landscape", num: 11, label: "Technology Landscape" },
    { id: "evidence_and_questions", num: 12, label: "Evidence & Questions" }
  ];

  const pendingReviewCount = useMemo(() => {
    if (!reportData) return 0;
    const pendingGaps = reportData.technology_gaps.filter(g => g.validation_status === "pending_review").length;
    const pendingOpps = reportData.rd_opportunities.filter(o => o.review_status === "pending_review").length;
    return pendingGaps + pendingOpps;
  }, [reportData]);

  const filteredEvidence = useMemo(() => {
    if (!reportData) return [];
    if (!evidenceSearch.trim()) return reportData.raw_sources;
    const q = evidenceSearch.toLowerCase();
    return reportData.raw_sources.filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.source_name.toLowerCase().includes(q) ||
      s.source_type.toLowerCase().includes(q) ||
      (s.organization && s.organization.toLowerCase().includes(q))
    );
  }, [reportData, evidenceSearch]);

  return (
    <div className="space-y-8 pb-16 print:p-0 print:space-y-4">
      {/* Header & Executive Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm print:border-none print:shadow-none print:p-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <FileText className="size-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Monthly R&D Intelligence Report
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Continuous Multi-Source Synthesis & Decision-Support Engine
                </p>
              </div>
            </div>
          </div>

          {/* Month Selector & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 print:hidden">
            {/* Month Dropdown */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold font-mono rounded-xl pl-3 pr-8 py-2 cursor-pointer hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              >
                {availableMonths.map((m) => (
                  <option key={m.year_month} value={m.year_month}>
                    {m.month_name} ({m.source_count} Sources)
                  </option>
                ))}
              </select>
              <Calendar className="size-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Regenerate Button */}
            <button
              onClick={handleRegenerate}
              disabled={generating}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all duration-150 disabled:opacity-50 cursor-pointer"
              title="Re-run AI analysis and delta calculation on this month data"
            >
              <RefreshCw className={`size-3.5 ${generating ? "animate-spin" : ""}`} />
              <span>{generating ? "Synthesizing..." : "Regenerate"}</span>
            </button>

            {/* Compare Months Button */}
            <button
              onClick={handleOpenComparison}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-blue-500" />
              <span>Compare Months</span>
            </button>

            {/* Human Review Queue Badge Button */}
            {pendingReviewCount > 0 && (
              <button
                onClick={() => {
                  const firstPendingGap = reportData?.technology_gaps.find(g => g.validation_status === "pending_review");
                  if (firstPendingGap) handleOpenReview(firstPendingGap);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold transition-colors cursor-pointer"
              >
                <AlertCircle className="size-3.5 text-amber-500" />
                <span>Review Queue ({pendingReviewCount})</span>
              </button>
            )}

            {/* Print / Export PDF */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="Print / Download Clean PDF"
            >
              <Printer className="size-4" />
            </button>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="Download Structured CSV Dossier"
            >
              <Download className="size-4" />
            </button>
          </div>
        </div>

        {/* Top KPI Metrics Bar */}
        {reportData && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                Sources Analyzed
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {reportData.evidence_summary.total_sources_analyzed}
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                ✓ {reportData.evidence_summary.duplicates_removed} Duplicates Filtered
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                Independent Signals
              </div>
              <div className="text-xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {reportData.evidence_summary.independent_sources}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Across India & Japan
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                Emerging Tech Signals
              </div>
              <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {reportData.emerging_signals.length}
              </div>
              <div className="text-[10px] text-purple-500 font-mono mt-0.5">
                Multi-Vector Trajectory
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                Technology Gaps
              </div>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {reportData.technology_gaps.length}
              </div>
              <div className="text-[10px] text-amber-500 font-mono mt-0.5">
                Evidence-Backed Gaps
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                R&D Opportunities
              </div>
              <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {reportData.rd_opportunities.length}
              </div>
              <div className="text-[10px] text-emerald-500 font-mono mt-0.5">
                Actionable Dossiers
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="text-[10.5px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
                High Reliability Tier
              </div>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {Math.round((reportData.evidence_summary.high_reliability_sources / Math.max(reportData.evidence_summary.independent_sources, 1)) * 100)}%
              </div>
              <div className="text-[10px] text-blue-500 font-mono mt-0.5">
                Official & Peer-Reviewed
              </div>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="size-8 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
            Synthesizing verified monthly intelligence data for {selectedMonth}...
          </p>
        </div>
      )}

      {!loading && reportData && (
        <div className="space-y-8">
          {/* Sticky Section Jump Navigation */}
          <div className="sticky top-16 z-20 bg-[#f8fafc]/90 dark:bg-[#0a0e1a]/90 backdrop-blur-md py-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto print:hidden">
            <div className="flex items-center gap-1.5 min-w-max">
              {sectionsList.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(sec.id);
                    document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${
                    activeSection === sec.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="size-4 rounded-full bg-black/10 dark:bg-white/10 text-[10px] flex items-center justify-center font-mono">
                    {sec.num}
                  </span>
                  <span>{sec.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* ========================================================= */}
          {/* SECTION 1: EXECUTIVE SUMMARY */}
          {/* ========================================================= */}
          <section id="executive_summary" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                  Section 01
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Executive Summary — {reportData.month_name}
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Key Evidence-Backed Observations
              </span>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 mb-5">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-200 leading-relaxed">
                💡 <strong>R&D Intelligence Mandate:</strong> The findings below are aggregated from continuous monitoring of official patent registries (IP India, J-PlatPat), peer-reviewed journals (IEEE, ACS, Nature), venture filings (Startup India), and gazetted sovereign directives. All observations link directly to traceable primary records.
              </p>
            </div>

            <div className="space-y-3">
              {reportData.executive_summary.map((point, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-colors"
                >
                  <div className="size-6 rounded-full bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-mono font-black text-xs mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                    {point}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 2: WHAT CHANGED THIS MONTH? */}
          {/* ========================================================= */}
          <section id="what_changed" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                  Section 02
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  What Changed This Month? (MoM Activity Matrix)
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Delta vs Previous Month
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-mono uppercase text-[11px]">
                  <tr>
                    <th className="p-3 rounded-l-xl">Intelligence Domain</th>
                    <th className="p-3 text-right">Previous Month</th>
                    <th className="p-3 text-right">Current Month</th>
                    <th className="p-3 text-right">Delta (%)</th>
                    <th className="p-3 text-center">Trajectory</th>
                    <th className="p-3 rounded-r-xl">Analytical Commentary</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportData.metrics_delta.map((metric, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {metric.category}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-500">
                        {metric.previous_count}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {metric.current_count}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">
                        <span className={metric.change_pct >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                          {metric.change_pct >= 0 ? `+${metric.change_pct}%` : `${metric.change_pct}%`}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          metric.trend === "accelerating"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : metric.trend === "growing"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}>
                          {metric.trend}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 leading-snug">
                        {metric.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 3: EMERGING TECHNOLOGY SIGNALS */}
          {/* ========================================================= */}
          <section id="emerging_signals" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-xs font-bold">
                  Section 03
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Emerging Technology Signals
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Multi-Factor Interpretable Scoring
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportData.emerging_signals.slice(0, 6).map((sig) => (
                <div
                  key={sig.technology_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400 font-bold block">
                        {sig.domain}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {sig.technology_name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-xs font-black">
                        Signal: {sig.signal_score}
                      </span>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        +{sig.growth_rate_pct}% Growth
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-3">
                    {sig.why_detected}
                  </p>

                  {/* Activity Vector Indicator Bar */}
                  <div className="grid grid-cols-5 gap-1.5 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10.5px] font-mono text-center mb-3">
                    <div>
                      <span className="text-slate-400 text-[9px] block">Research</span>
                      <span className="font-bold text-blue-500">{sig.research_activity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Patent</span>
                      <span className="font-bold text-purple-500">{sig.patent_activity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Company</span>
                      <span className="font-bold text-emerald-500">{sig.company_activity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Market</span>
                      <span className="font-bold text-slate-500">{sig.market_activity}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Policy</span>
                      <span className="font-bold text-amber-500">{sig.policy_activity}</span>
                    </div>
                  </div>

                  {/* Organizations & Formula Tag */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex flex-wrap items-center gap-1">
                      {sig.key_organizations.slice(0, 2).map((org, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                          {org}
                        </span>
                      ))}
                    </div>
                    <span className="text-[9.5px] font-mono text-slate-400" title="Formula: 0.25*Research + 0.25*Patents + 0.20*Companies + 0.15*Policy + 0.15*Reliability">
                      {sig.evidence_count} Evidence Items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 4: RESEARCH DEVELOPMENTS */}
          {/* ========================================================= */}
          <section id="research_developments" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                  Section 04
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Peer-Reviewed Research Breakthroughs
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Verified DOIs & Institutes
              </span>
            </div>

            <div className="space-y-3">
              {reportData.research_developments.map((dev) => (
                <div
                  key={dev.development_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-4 text-blue-500 shrink-0" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {dev.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      📅 {dev.when_date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {dev.what_happened}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span>🏛️ {dev.who_involved.join(", ")}</span>
                      <span>·</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{dev.technology}</span>
                    </div>
                    {dev.evidence_sources[0] && (
                      <a
                        href={dev.evidence_sources[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-600 hover:underline font-bold"
                      >
                        <span>View Source DOI / Paper</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 5: PATENT DEVELOPMENTS */}
          {/* ========================================================= */}
          <section id="patent_developments" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono text-xs font-bold">
                  Section 05
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Patent Registrations & Granted Claims
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                IP India & JPO Registries
              </span>
            </div>

            <div className="space-y-3">
              {reportData.patent_developments.map((dev) => (
                <div
                  key={dev.development_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-purple-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Scale className="size-4 text-purple-500 shrink-0" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {dev.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold shrink-0">
                      {dev.evidence_sources[0]?.doi_or_patent_no || "Patent Filing"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {dev.what_happened}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span>🏢 Assignee: {dev.who_involved.join(", ")}</span>
                      <span>·</span>
                      <span>Market: {dev.market}</span>
                    </div>
                    {dev.evidence_sources[0] && (
                      <a
                        href={dev.evidence_sources[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-purple-600 hover:underline font-bold"
                      >
                        <span>Official Patent Registry Link</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 6: COMPANY & STARTUP DEVELOPMENTS */}
          {/* ========================================================= */}
          <section id="company_startup_developments" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                  Section 06
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Company & Startup R&D Moves
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                DPIIT Startups & Corporate Tracks
              </span>
            </div>

            <div className="space-y-3">
              {reportData.company_startup_developments.map((dev) => (
                <div
                  key={dev.development_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-emerald-500 shrink-0" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {dev.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      📅 {dev.when_date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {dev.what_happened}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <span>🚀 Organization: {dev.who_involved.join(", ")}</span>
                      <span>·</span>
                      <span>Domain: {dev.technology}</span>
                    </div>
                    {dev.evidence_sources[0] && (
                      <a
                        href={dev.evidence_sources[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 hover:underline font-bold"
                      >
                        <span>View Venture / Announcement</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 7: MARKET DEVELOPMENTS */}
          {/* ========================================================= */}
          <section id="market_developments" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                  Section 07
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Market Dynamics & Industrial Adoption
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Verified Facts vs Forecasts
              </span>
            </div>

            <div className="space-y-3">
              {reportData.market_developments.map((dev) => (
                <div
                  key={dev.development_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {dev.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-mono font-bold">
                      Fact-Checked Market Report
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
                    {dev.what_happened}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 8: POLICY & STANDARDS DEVELOPMENTS */}
          {/* ========================================================= */}
          <section id="policy_developments" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-xs font-bold">
                  Section 08
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Policy, Standards & Sovereign Gazettes
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                MeitY, MHI, BIS & Gazette of India
              </span>
            </div>

            <div className="space-y-3">
              {reportData.policy_developments.map((dev) => (
                <div
                  key={dev.development_id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-amber-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="size-4 text-amber-500 shrink-0" />
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {dev.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-amber-600 dark:text-amber-400 font-bold shrink-0">
                      🏛️ {dev.who_involved.join(", ")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                    {dev.what_happened}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      Official Gazette / Standard Reference
                    </span>
                    {dev.evidence_sources[0] && (
                      <a
                        href={dev.evidence_sources[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-600 hover:underline font-bold"
                      >
                        <span>Official Gazette Notification</span>
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 9: TECHNOLOGY GAPS & LIMITATIONS */}
          {/* ========================================================= */}
          <section id="technology_gaps" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono text-xs font-bold">
                  Section 09
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Technology Gaps & Limitations
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Market Need + Limitations → Inferred Gap
              </span>
            </div>

            <div className="space-y-4">
              {reportData.technology_gaps.map((gap) => (
                <div
                  key={gap.gap_id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-rose-400 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                        {gap.technology}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {gap.potential_gap}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Classification Badge */}
                      <span className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold border ${
                        gap.classification_label === "Evidence-backed observation"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                          : gap.classification_label === "Potential gap"
                          ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950 dark:text-purple-300"
                      }`}>
                        {gap.classification_label}
                      </span>

                      {/* Review Action Trigger */}
                      <button
                        onClick={() => handleOpenReview(gap)}
                        className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                          gap.validation_status === "approved"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200"
                            : gap.validation_status === "rejected"
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200"
                            : "bg-amber-500 text-white shadow-sm"
                        }`}
                      >
                        {gap.validation_status === "approved" ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            <span>Approved</span>
                          </>
                        ) : gap.validation_status === "rejected" ? (
                          <>
                            <XCircle className="size-3" />
                            <span>Rejected</span>
                          </>
                        ) : (
                          <>
                            <Edit3 className="size-3" />
                            <span>Review</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs mb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                        1. Market Need
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">
                        {gap.market_need}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-0.5">
                        2. Current Technology Activity
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">
                        {gap.technology_activity}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-rose-500 font-bold block mb-0.5">
                        3. Observed Limitation
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-snug">
                        {gap.observed_limitations}
                      </p>
                    </div>
                  </div>

                  {gap.reviewer_notes && (
                    <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg">
                      ✍️ <strong>Researcher Validation Note:</strong> {gap.reviewer_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 10: POTENTIAL R&D OPPORTUNITIES */}
          {/* ========================================================= */}
          <section id="rd_opportunities" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                  Section 10
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Potential R&D Opportunities for Investigation
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Evidence-Backed Decision Dossiers
              </span>
            </div>

            <div className="space-y-6">
              {reportData.rd_opportunities.map((opp) => (
                <div
                  key={opp.opportunity_id}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                          Maturity: {opp.technology_maturity}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold">
                          Confidence: {Math.round(opp.confidence_score * 100)}%
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {opp.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => handleOpenReview(opp)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer shrink-0"
                    >
                      <Edit3 className="size-3.5" />
                      <span>Review / Endorse</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4 text-xs">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                          Core Technical Problem
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {opp.problem}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                          Potential Technology Gap & Proposed Solution
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-semibold text-blue-600 dark:text-blue-400">
                          {opp.potential_gap}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                          Existing Approaches & Limitations
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {opp.existing_approaches}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                          Market & Research Relevance
                        </span>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                          {opp.market_relevance} {opp.research_relevance}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                          Potential Partner Institutions & Labs
                        </span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {opp.potential_partners.map((partner, pIdx) => (
                            <span
                              key={pIdx}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200"
                            >
                              🤝 {partner}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10.5px] font-mono font-bold text-slate-400 uppercase block mb-1">
                          Suggested Next Investigation for Human Researcher
                        </span>
                        <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                          🔍 {opp.suggested_investigation}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Evidence Links */}
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                      <ShieldCheck className="size-4 text-emerald-500" />
                      <span>Grounded in {opp.evidence_sources.length} Verified Evidence Records</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {opp.evidence_sources.map((ev, eIdx) => (
                        <a
                          key={eIdx}
                          href={ev.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10.5px] font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>{ev.source_name.slice(0, 24)}...</span>
                          <ExternalLink className="size-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 11: TECHNOLOGY LANDSCAPE */}
          {/* ========================================================= */}
          <section id="technology_landscape" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold">
                  Section 11
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Technology Landscape & Relationship Map
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Connected Nodes & Cross-Domain Links
              </span>
            </div>

            {/* Visual Relational Cluster Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {reportData.technology_landscape.clusters.map((cluster, cIdx) => (
                <div
                  key={cIdx}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 mb-2 font-mono uppercase">
                    <Network className="size-4" />
                    <span>{cluster.cluster}</span>
                  </div>
                  <div className="space-y-1.5">
                    {cluster.nodes.map((nodeId) => {
                      const node = reportData.technology_landscape.nodes.find(n => n.id === nodeId);
                      if (!node) return null;
                      return (
                        <div
                          key={nodeId}
                          className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between"
                        >
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {node.label}
                          </span>
                          <span className="text-[9.5px] font-mono text-slate-400 uppercase">
                            {node.node_type}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Edge Relational Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono uppercase text-[10.5px]">
                  <tr>
                    <th className="p-2.5 rounded-l-lg">Source Entity</th>
                    <th className="p-2.5 text-center">Relationship</th>
                    <th className="p-2.5 rounded-r-lg">Target Technology</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportData.technology_landscape.edges.map((edge, idx) => {
                    const src = reportData.technology_landscape.nodes.find(n => n.id === edge.source_id);
                    const tgt = reportData.technology_landscape.nodes.find(n => n.id === edge.target_id);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono">
                        <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                          {src?.label || edge.source_id} ({src?.node_type})
                        </td>
                        <td className="p-2.5 text-center text-blue-600 dark:text-blue-400 font-bold">
                          → {edge.relation.replace("_", " ")} →
                        </td>
                        <td className="p-2.5 font-bold text-purple-600 dark:text-purple-400">
                          {tgt?.label || edge.target_id}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* ========================================================= */}
          {/* SECTION 12: EVIDENCE SUMMARY & RESEARCH QUESTIONS */}
          {/* ========================================================= */}
          <section id="evidence_and_questions" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm scroll-mt-28">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold">
                  Section 12
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Evidence Coverage & Research Questions
                </h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Provenance & Actionable Researcher Inquiries
              </span>
            </div>

            {/* Actionable Questions Box */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-800 dark:border-slate-700 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase text-blue-400 font-bold mb-3">
                <HelpCircle className="size-4" />
                <span>Priority Research Inquiries for Enterprise R&D Teams</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {reportData.researcher_questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3 rounded-xl bg-slate-800/80 dark:bg-slate-900/80 border border-slate-700/60 flex items-start gap-2.5"
                  >
                    <span className="size-5 rounded bg-blue-600 text-white text-[10.5px] font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {qIdx + 1}
                    </span>
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {q}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Evidence Search & Table */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Complete Traceable Evidence List ({filteredEvidence.length} Sources)
                </h3>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={evidenceSearch}
                    onChange={(e) => setEvidenceSearch(e.target.value)}
                    placeholder="Filter by organization, title..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <Search className="size-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
              </div>

              <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono uppercase text-[10.5px] sticky top-0">
                    <tr>
                      <th className="p-2.5">Source / Publisher</th>
                      <th className="p-2.5">Title & Verbatim Excerpt</th>
                      <th className="p-2.5 text-center">Reliability</th>
                      <th className="p-2.5 text-right">Date / Registry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredEvidence.map((ev, eIdx) => (
                      <tr key={eIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white font-mono text-[11px] whitespace-nowrap">
                          {ev.source_name.split("·")[0]}
                        </td>
                        <td className="p-2.5">
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-slate-900 dark:text-white hover:text-blue-600 block mb-0.5"
                          >
                            {ev.title}
                          </a>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {ev.verbatim_excerpt}
                          </p>
                        </td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            ev.reliability_tier === "High"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                          }`}>
                            {ev.reliability_tier} ({Math.round(ev.reliability_score * 100)}%)
                          </span>
                        </td>
                        <td className="p-2.5 text-right font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {ev.publication_date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ========================================================= */}
      {/* HUMAN REVIEW MODAL */}
      {/* ========================================================= */}
      {reviewModalOpen && selectedInsight && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="size-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Human Review & Endorsement
                </h3>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold font-mono flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                  {"technology" in selectedInsight ? selectedInsight.technology : "R&D Opportunity"}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                  {"title" in selectedInsight ? selectedInsight.title : selectedInsight.potential_gap}
                </h4>
              </div>

              {isEditing ? (
                <div>
                  <label className="text-[10.5px] font-mono font-bold text-slate-500 block mb-1">
                    Edit Insight Text:
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                    AI Inferred Proposition:
                  </span>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                    {"potential_gap" in selectedInsight ? selectedInsight.potential_gap : (selectedInsight as MonthlyRDOpportunity).problem}
                  </p>
                </div>
              )}

              <div>
                <label className="text-[10.5px] font-mono font-bold text-slate-500 block mb-1">
                  Reviewer Notes / Technical Validation Rationale:
                </label>
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g., Verified against experimental cycle-life test data"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="size-3.5" />
                <span>{isEditing ? "Cancel Edit" : "Edit Text"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleReviewAction("reject")}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReviewAction("approve")}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1"
                >
                  <Check className="size-3.5" />
                  <span>Approve & Endorse</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MONTH-TO-MONTH COMPARISON MODAL */}
      {/* ========================================================= */}
      {compareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Month-to-Month Comparative Intelligence
                </h3>
              </div>
              <button
                onClick={() => setCompareModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Base Month (A)
                </span>
                <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 font-mono">
                  {selectedMonth} ({reportData?.month_name})
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Comparison Month (B)
                </span>
                <select
                  value={compareMonth2}
                  onChange={(e) => handleCompareMonthChange(e.target.value)}
                  className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                >
                  {availableMonths.map((m) => (
                    <option key={m.year_month} value={m.year_month}>
                      {m.month_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {comparingLoading && (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="size-6 text-blue-600 animate-spin" />
                <span className="text-xs font-mono text-slate-500">Calculating comparative deltas...</span>
              </div>
            )}

            {!comparingLoading && comparisonData && (
              <div className="space-y-4">
                {/* Side-by-side KPI overview */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                    <div className="font-bold text-blue-900 dark:text-blue-300 mb-1">
                      {comparisonData.month1.month_name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Sources: <strong>{comparisonData.month1.total_sources}</strong> | Tech Signals: <strong>{comparisonData.month1.signals_count}</strong>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900">
                    <div className="font-bold text-purple-900 dark:text-purple-300 mb-1">
                      {comparisonData.month2.month_name}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      Sources: <strong>{comparisonData.month2.total_sources}</strong> | Tech Signals: <strong>{comparisonData.month2.signals_count}</strong>
                    </div>
                  </div>
                </div>

                {/* Technology Trajectory Shifts Table */}
                <div>
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-500 dark:text-slate-400 mb-2">
                    Technology Activity Comparison & Growth Acceleration
                  </h4>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono uppercase text-[10px]">
                        <tr>
                          <th className="p-2">Technology</th>
                          <th className="p-2 text-right">Month A Score</th>
                          <th className="p-2 text-right">Month B Score</th>
                          <th className="p-2 text-right">Delta</th>
                          <th className="p-2 text-center">Trajectory</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {comparisonData.technology_comparison.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 font-mono">
                            <td className="p-2 font-bold text-slate-900 dark:text-white">
                              {row.technology}
                            </td>
                            <td className="p-2 text-right text-blue-600 font-bold">
                              {row.month1_score}
                            </td>
                            <td className="p-2 text-right text-slate-500">
                              {row.month2_score}
                            </td>
                            <td className="p-2 text-right font-bold">
                              <span className={row.score_delta >= 0 ? "text-emerald-600" : "text-rose-600"}>
                                {row.score_delta >= 0 ? `+${row.score_delta}` : row.score_delta}
                              </span>
                            </td>
                            <td className="p-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                                row.trend === "accelerating" || row.trend === "new"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              }`}>
                                {row.trend}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
