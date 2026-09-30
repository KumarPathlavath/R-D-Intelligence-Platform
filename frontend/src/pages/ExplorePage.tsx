import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { SourceBadge } from '../components/SourceBadge';
import { TrustGauge } from '../components/TrustGauge';
import { SignalItem } from '../types';
import { SOURCE_CONFIGS } from '../data/mockData';
import { api } from '../services/api';
import { Search, MapPin, FileBadge, Tag, Clock, ArrowUpRight, ChevronRight, X } from 'lucide-react';
import { getRelativeTimeIST } from '../utils/istTime';

export const ExplorePage: React.FC = () => {
  const [signals, setSignals] = useState<SignalItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGeo, setSelectedGeo] = useState('All');

  const geographies = ['All', 'India', 'Japan', 'Global'];

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    const data = await api.getSignals();
    setSignals(data);
  };

  const filteredSignals = useMemo(() => {
    return signals.filter((sig) => {
      const matchGeo = selectedGeo === 'All' || sig.geography.toLowerCase() === selectedGeo.toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchQuery =
        !q ||
        sig.title.toLowerCase().includes(q) ||
        sig.summary.toLowerCase().includes(q) ||
        sig.domain.toLowerCase().includes(q) ||
        sig.origin.toLowerCase().includes(q);
      return matchGeo && matchQuery;
    });
  }, [signals, selectedGeo, searchQuery]);

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="space-y-1.5 pt-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight font-sans">
          Explore & Early Signals
        </h1>
        <p className="text-xs sm:text-[13.5px] text-[#64748b] dark:text-slate-400 max-w-2xl leading-relaxed">
          Continuous scan of Indian and global research, patents, policy, and deep-tech funding.
        </p>
      </div>

      {/* Search & Geography Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Search Bar Input */}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 px-3.5 py-2 text-xs w-full sm:flex-1 shadow-2xs">
          <Search className="size-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search signals, domains, claims…"
            className="min-w-0 flex-1 bg-transparent text-xs sm:text-[13px] outline-none placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Region Pills: ALL, INDIA, JAPAN, GLOBAL (Positioned neatly) */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-2xs shrink-0">
          {geographies.map((geo) => {
            const isActive = selectedGeo === geo;
            return (
              <button
                key={geo}
                onClick={() => setSelectedGeo(geo)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {geo === 'India' ? '🇮🇳 India' : geo === 'Japan' ? '🇯🇵 Japan' : geo === 'Global' ? '🌐 Global' : 'All'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Signals Feed: Vertical Stack */}
      {filteredSignals.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-2">
          <p className="font-bold text-base text-slate-900 dark:text-white">No signals match that filter</p>
          <p className="text-xs text-slate-400">
            Widen the geography or clear the keyword to see the full feed.
          </p>
        </div>
      ) : (
        <div className="flex flex-col space-y-6 sm:space-y-7">
          {filteredSignals.map((signal) => {
            const config = SOURCE_CONFIGS[signal.source] || SOURCE_CONFIGS.news;
            const timeAgo = signal.ingestedAt ? getRelativeTimeIST(signal.ingestedAt) : signal.date;

            return (
              <div
                key={signal.id}
                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:border-indigo-300 transition-all duration-200 space-y-5"
              >
                {/* Top Section */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                      {signal.applicant || signal.origin || 'Authoring Research Lab'}
                    </span>

                    <TrustGauge value={config.trust} color={config.ring} />
                  </div>

                  <h2 className="text-[17.5px] sm:text-[19.5px] font-extrabold text-[#0f172a] dark:text-white leading-snug tracking-tight">
                    {signal.title}
                  </h2>

                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {signal.summary}
                  </p>
                </div>

                {/* 4-Column Box Model */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 py-3.5 px-4 sm:px-5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-blue-500 shrink-0" />
                      <span>Location</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {signal.geography === 'India' ? '🇮🇳 India' : signal.geography === 'Japan' ? '🇯🇵 Japan' : '🌐 Global'}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <FileBadge className="size-3.5 text-indigo-500 shrink-0" />
                      <span>Source</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {signal.source === 'peer-reviewed' ? 'Research Paper' : signal.source === 'patent' ? 'Patent Registry' : signal.source === 'startup' ? 'Startup / VC' : 'Policy'}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <Tag className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Domain</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {signal.domain || 'Energy'}
                    </div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <Clock className="size-3.5 text-amber-500 shrink-0" />
                      <span>Ingested</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {timeAgo}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Row */}
                <div className="flex items-center justify-between pt-1 text-xs sm:text-[13px]">
                  <span className="text-slate-500 font-mono font-medium truncate max-w-sm">
                    {signal.origin}
                  </span>

                  <span className="text-xs sm:text-[13px] font-extrabold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
                    <span>Verified Signal</span>
                    <ChevronRight className="size-4 stroke-[2.5]" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
