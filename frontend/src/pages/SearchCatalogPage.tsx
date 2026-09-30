import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../services/api';
import { CatalogRow } from '../types';
import { SourceBadge } from '../components/SourceBadge';
import {
  Search,
  Download,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  Database
} from 'lucide-react';

export const SearchCatalogPage: React.FC = () => {
  const [catalogRows, setCatalogRows] = useState<CatalogRow[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedGeo, setSelectedGeo] = useState('All');
  const [sortKey, setSortKey] = useState<keyof CatalogRow>('date');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    api.getCatalogRows().then(setCatalogRows);
  }, []);

  const filteredRows = useMemo(() => {
    let list = [...catalogRows];
    if (selectedSource !== 'All') {
      list = list.filter((r) => r.source === selectedSource);
    }
    if (selectedGeo !== 'All') {
      list = list.filter((r) => r.geography.toLowerCase() === selectedGeo.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.signal.toLowerCase().includes(q) ||
          r.domain.toLowerCase().includes(q) ||
          r.metric.toLowerCase().includes(q)
      );
    }
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
  }, [catalogRows, selectedSource, selectedGeo, searchQuery, sortKey, sortAsc]);

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
    const rows = filteredRows.map((r) =>
      [r.signal, r.domain, r.source, r.geography, r.date, r.metric, r.delta]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csvContent = `${headers.join(',')}\n${rows.join('\n')}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'techintel-structured-catalog.csv');
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
          Search Tasks & Structured Catalog
        </h1>
        <p className="text-xs sm:text-[13.5px] text-[#64748b] dark:text-slate-400 max-w-2xl leading-relaxed">
          Browse, query, and export structured technology signals, Indian patent filings, and verified research breakthroughs.
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs shadow-2xs">
            <Search className="size-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across signals, institutions, metrics..."
              className="bg-transparent outline-none w-full text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-[13px]"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-2xs hover:shadow transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 font-mono text-[11px] uppercase tracking-wider">Geography:</span>
            <select
              value={selectedGeo}
              onChange={(e) => setSelectedGeo(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="All">All Geographies</option>
              <option value="India">🇮🇳 India</option>
              <option value="Japan">🇯🇵 Japan</option>
              <option value="Global">🌐 Global</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 font-mono text-[11px] uppercase tracking-wider">Source Type:</span>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1 text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 font-medium outline-none cursor-pointer text-xs"
            >
              <option value="All">All Sources</option>
              <option value="peer-reviewed">Peer-Reviewed Papers</option>
              <option value="patent">Patents (IPO / USPTO / JPO)</option>
              <option value="policy">Government Policy / PLI</option>
              <option value="startup">DeepTech Startups & VC</option>
            </select>
          </div>
        </div>
      </div>

      {/* Catalog Table Card Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs sm:text-[13px]">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-mono uppercase tracking-wider">
                <th className="py-3.5 px-5">
                  <button
                    onClick={() => handleSort('signal')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer font-bold"
                  >
                    <span>Signal Title</span>
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('domain')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer font-bold"
                  >
                    <span>Domain</span>
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('geography')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer font-bold"
                  >
                    <span>Geo</span>
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('date')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer font-bold"
                  >
                    <span>Date</span>
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    onClick={() => handleSort('delta')}
                    className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer font-bold"
                  >
                    <span>Δ vs Baseline</span>
                    <ArrowUpDown className="size-3" />
                  </button>
                </th>
                <th className="py-3.5 px-5 font-bold">Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-5 font-bold text-slate-900 dark:text-white">{row.signal}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{row.domain}</td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-mono font-medium">
                    {row.geography}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">{row.date}</td>
                  <td className="py-3.5 px-4 font-bold text-emerald-600 font-mono">
                    +{row.delta}%
                  </td>
                  <td className="py-3.5 px-5">
                    <SourceBadge source={row.source} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
