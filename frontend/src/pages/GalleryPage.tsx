import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../services/api';
import { OpportunityItem } from '../types';
import {
  Sparkles,
  Search,
  Handshake,
  FlaskConical,
  ExternalLink,
  Download,
  Share2,
  CheckCircle2,
  Cpu,
  Layers,
  Zap,
  Activity,
  Box
} from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All (78)');
  const [searchFilter, setSearchFilter] = useState('');

  const filterPills = [
    'All (78)',
    'community-test-agent (1)',
    'Quick Research (3)',
    'Design FTO Search (3)',
    'Find solutions (Material) (3)',
    'TRIZ Solution (3)',
    'Formulation (Material) (3)',
    'FTO Search (7)',
    'Novelty Search (4)',
    'Indian Research (IIT/IISc) (22)',
    'IPO Patents (18)',
    'MeitY & PLI Policy (8)'
  ];

  const galleryCardPresets = [
    {
      id: 'gal-1',
      category: 'IP/Novelty Search',
      categoryColor: 'bg-blue-600 text-white',
      title: 'Humanoid Robot Leg Power Structure Patent Search and Analysis',
      description: 'Analyzes a compact leg power structure combining harmonic drive and planetary reduction with Indian patent filings.',
      imageBg: 'from-slate-800 to-slate-900',
      icon: Cpu,
      svgType: 'robot',
      partnership: 'IIT Madras Center for Robotics and Tata Motors Advanced Engineering.',
      labTest: 'Fabricate scale planetary transmission gear; run 500h torque shock test.'
    },
    {
      id: 'gal-2',
      category: 'IP/FTO Search',
      categoryColor: 'bg-blue-600 text-white',
      title: 'Elevator Door Motion Categorization System Low-Power FTO Search Report',
      description: 'Analyzes freedom-to-operate for a low-power mmWave radar door categorization sensor avoiding Otis and Schindler IP barriers.',
      imageBg: 'from-blue-900 to-slate-900',
      icon: Layers,
      svgType: 'sensor',
      partnership: 'IISc CeNSE Sensing Group and Indian Elevator OEM Consortium.',
      labTest: 'Deploy 60GHz FMCW radar module in elevator test tower; measure false obstruction rates.'
    },
    {
      id: 'gal-3',
      category: 'R&D/TRIZ Solution',
      categoryColor: 'bg-blue-600 text-white',
      title: 'How to reduce the area of 5G millimeter wave antenna impedance matching circuit by 40%',
      description: 'Help you find solutions to reduce the physical footprint of transparent sub-THz metasurfaces without sacrificing bandwidth.',
      imageBg: 'from-emerald-950 to-slate-900',
      icon: Zap,
      svgType: 'circuit',
      partnership: 'IIT Madras 5G/6G Group and Advanced Communications Division.',
      labTest: 'Pattern roll-to-roll copper mesh on transparent PET film; measure S11 at 140 GHz.'
    }
  ];

  useEffect(() => {
    api.getOpportunities().then(setOpportunities);
  }, []);

  const filteredOpps = useMemo(() => {
    let list = [...opportunities];
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.capability.toLowerCase().includes(q) ||
          o.partnership.toLowerCase().includes(q)
      );
    }
    return list;
  }, [opportunities, searchFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
          Gallery
        </h1>
        <p className="text-sm text-[#64748b]">
          Discover how others use Eureka agents, to explore real queries, insights, and reports shared in the Gallery.
        </p>
      </div>

      {/* Filter Pills Cloud */}
      <div className="flex flex-wrap gap-2 pt-2">
        {filterPills.map((pill) => {
          const isActive = activeCategory === pill;
          return (
            <button
              key={pill}
              onClick={() => setActiveCategory(pill)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-2">
        {/* Preset Gallery Cards matching PatSnap Screenshot 2 */}
        {galleryCardPresets.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Visual Image / Schematic Banner */}
                <div className={`h-40 bg-gradient-to-tr ${card.imageBg} p-4 flex flex-col justify-between relative overflow-hidden text-white`}>
                  <div className="flex items-center justify-between z-10">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-500 text-white font-mono uppercase tracking-wide">
                      {card.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">
                      PatSnap Verified
                    </span>
                  </div>

                  {/* Technical Graphic Artwork */}
                  <div className="flex items-center justify-center my-auto">
                    <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                      <Icon className="size-8 text-sky-300" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-300 z-10 font-mono">
                    <span>Indian & Global IP</span>
                    <span className="text-emerald-400 font-bold">92% Conviction</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {card.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {card.description}
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 text-[10px] uppercase font-mono text-blue-700">
                      <Handshake className="size-3 text-blue-600" /> Proposed Partnership:
                    </span>
                    <p className="text-slate-600 text-[11px]">{card.partnership}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500 mt-2">
                <span className="text-[11px] font-mono">Falsifiable Next Lab Step</span>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                  <span>View Report</span>
                  <span>↗</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Dynamic Opportunities from System Database */}
        {filteredOpps.map((opp) => (
          <div
            key={opp.id}
            className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              {/* Visual Banner */}
              <div className="h-40 bg-gradient-to-tr from-sky-950 to-slate-900 p-4 flex flex-col justify-between relative text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-600 text-white font-mono uppercase tracking-wide">
                    {opp.gapType?.replace('_', ' ').toUpperCase() || 'R&D DOSSIER'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {opp.confidence}% Conviction
                  </span>
                </div>

                <div className="flex items-center justify-center my-auto">
                  <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                    <Activity className="size-8 text-sky-400" />
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 font-mono flex justify-between">
                  <span>📍 {opp.geography || 'India'}</span>
                  <span>{opp.firstDetected || '2026-09-18'}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <span className="text-[10px] font-bold font-mono uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                  {opp.capability}
                </span>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {opp.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {opp.rationale}
                </p>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-1">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-[10px] uppercase font-mono">
                    <Handshake className="size-3" /> Partnership:
                  </span>
                  <p className="text-slate-700 text-[11px]">{opp.partnership}</p>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
              <span className="text-[11px] font-mono">Triage: {opp.triageStatus || 'Unreviewed'}</span>
              <button className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                <span>Inspect Dossier</span>
                <span>↗</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
