import React, { useState, useMemo, useEffect } from 'react';
import { BaselineNoveltyItem, CatalogRow } from '../types';
import { api } from '../services/api';
import { SourceBadge } from '../components/SourceBadge';
import {
  ArrowRight,
  ArrowUpDown,
  Download,
  Layers,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

export const IntelligencePage: React.FC = () => {
  const [baselines, setBaselines] = useState<BaselineNoveltyItem[]>([]);
  const [catalogRows, setCatalogRows] = useState<CatalogRow[]>([]);
  const [sortKey, setSortKey] = useState<keyof CatalogRow>('date');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [bData, cData] = await Promise.all([
      api.getBaselines(),
      api.getCatalogRows()
    ]);
    setBaselines(bData);
    setCatalogRows(cData);
  };

  const sortedRows = useMemo(() => {
    const list = [...catalogRows];
    list.sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return list;
  }, [catalogRows, sortKey, sortAsc]);

  const handleSort = (key: keyof CatalogRow) => {
    if (key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const handleExportCSV = () => {
    const headers = ['signal', 'domain', 'source', 'geography', 'date', 'metric', 'delta_percent'];
    const rows = sortedRows.map(r =>
      [r.signal, r.domain, r.source, r.geography, r.date, r.metric, r.delta]
        .map(cell => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = `${headers.join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'techintel-structured-signals.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-1.5 pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight font-sans">
          Structured Intelligence & Prior Art
        </h1>
        <p className="text-xs sm:text-[13.5px] text-[#64748b] dark:text-slate-400 max-w-2xl leading-relaxed">
          What exactly changed against prior art — and the structured, exportable catalog behind it.
        </p>
      </div>

      {/* Baseline vs Novelty Comparison Cards Grid (Vertical Stack) */}
      <div className="flex flex-col space-y-6 sm:space-y-7">
        {baselines.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-300 transition-all duration-200 space-y-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                {item.domain}
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                {item.leadOrg || 'Validated Delta'}
              </span>
            </div>

            {/* Side-by-side comparative boxes with central arrow */}
            <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
              {/* Baseline Box */}
              <div className="min-w-0 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 p-4 sm:p-4.5 border border-slate-100 dark:border-slate-800/60 h-full flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10.5px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                    Established Baseline
                  </p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white text-xs sm:text-[13.5px] leading-snug">
                    {item.baseline.title}
                  </p>
                </div>
                {item.baseline.points && item.baseline.points.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {item.baseline.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-slate-400">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Central Arrow */}
              <div className="flex justify-center text-indigo-600 dark:text-indigo-400">
                <ArrowRight className="size-5 shrink-0" />
              </div>

              {/* Novel Signal Box */}
              <div className="min-w-0 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/30 p-4 sm:p-4.5 border border-indigo-100 dark:border-indigo-900/60 h-full flex flex-col justify-between space-y-3">
                <div>
                  <p className="text-[10.5px] uppercase font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Novel Breakthrough
                  </p>
                  <p className="mt-1 font-bold text-slate-900 dark:text-white text-xs sm:text-[13.5px] leading-snug">
                    {item.novelty.title}
                  </p>
                </div>
                {item.novelty.points && item.novelty.points.length > 0 && (
                  <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
                    {item.novelty.points.map((pt, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-medium">{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Bottom Footer */}
            {item.impact && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {item.impact}
                </span>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
                  <span>Explore Comparison</span>
                  <ChevronRight className="size-4 stroke-[2.5]" />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
