import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  Building2,
  FileText,
  ShieldCheck,
  Sparkles,
  Globe,
  Tag,
  Link2,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { SignalItem, SourceType } from '../types';
import { formatISTClock } from '../utils/istTime';

interface RegisterSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignalCreated: (signal: SignalItem) => void;
}

export const RegisterSignalModal: React.FC<RegisterSignalModalProps> = ({
  isOpen,
  onClose,
  onSignalCreated
}) => {
  const [itemType, setItemType] = useState<'startup_signup' | 'patent_filing' | 'paper_publication' | 'policy_directive'>('startup_signup');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [applicant, setApplicant] = useState('');
  const [domain, setDomain] = useState('Energy');
  const [geography, setGeography] = useState('India');
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !applicant.trim()) return;

    setIsSubmitting(true);

    let mappedSource: SourceType = 'startup';
    if (itemType === 'patent_filing') mappedSource = 'patent';
    else if (itemType === 'paper_publication') mappedSource = 'peer-reviewed';
    else if (itemType === 'policy_directive') mappedSource = 'policy';

    const newSig = await api.createSignal({
      title: title.trim(),
      summary: summary.trim() || title.trim(),
      applicant: applicant.trim(),
      source: mappedSource,
      domain,
      geography,
      url: url.trim() || (mappedSource === 'patent' ? 'https://ipindia.gov.in/' : mappedSource === 'peer-reviewed' ? 'https://irins.inflibnet.ac.in/' : 'https://www.startupindia.gov.in/'),
      item_type: itemType
    });

    setIsSubmitting(false);
    onSignalCreated(newSig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="size-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] font-mono flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE IST INGESTION · {formatISTClock()}
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Register Live Discovery / Startup Upload
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Incoming discovery will be placed at the <strong>very top</strong> of the Live Radar with real-time IST timestamps.
          </p>
        </div>

        {/* Item Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'startup_signup', label: 'Startup Signup', icon: Building2 },
            { id: 'patent_filing', label: 'Patent Filing', icon: ShieldCheck },
            { id: 'paper_publication', label: 'Research Paper', icon: FileText },
            { id: 'policy_directive', label: 'Policy / Grant', icon: Tag }
          ].map((type) => {
            const Icon = type.icon;
            const isSel = itemType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setItemType(type.id as any)}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all cursor-pointer ${
                  isSel
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold leading-tight">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {itemType === 'startup_signup' ? 'Startup / Venture Name & Pitch Title' : itemType === 'patent_filing' ? 'Patent Application Title & Invention Claim' : 'Research Title / Breakthrough Subject'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                itemType === 'startup_signup'
                  ? 'e.g. VoltLeaf Systems: Fast-Swappable Solid-State Battery Enclosure'
                  : itemType === 'patent_filing'
                  ? 'e.g. Planar High-Density Inductive Sheet Coil for Dynamic EV Charging'
                  : 'e.g. Low-Temperature ALD Passivation on 55°C Sodium-Ion Cathodes'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Organization / Applicant / Founders
              </label>
              <input
                type="text"
                required
                value={applicant}
                onChange={(e) => setApplicant(e.target.value)}
                placeholder="e.g. IIT Madras CBEEV / VoltLeaf Labs"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Domain / Technology Field
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="Energy">Energy & Battery Storage</option>
                <option value="Materials">Advanced Materials & Polymers</option>
                <option value="AI Agents">AI Agents & Optimization</option>
                <option value="Semiconductors">Semiconductors & GaN/SiC</option>
                <option value="Robotics">Robotics & Autonomous Systems</option>
                <option value="Biopharma">Biopharma & Continuous Flow APIs</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Region / Sovereign Origin
              </label>
              <select
                value={geography}
                onChange={(e) => setGeography(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              >
                <option value="India">India (DPIIT / IPO / IITs)</option>
                <option value="Japan">Japan (METI / JPO / Tokyo)</option>
                <option value="USA">USA (USPTO / NSF / Silicon Valley)</option>
                <option value="Europe">Europe (EPO / Horizon)</option>
                <option value="Global">Global / Cross-Border</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Verification URL / Registry Link
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ipindia.gov.in/... or https://startupindia.gov.in/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Technical Summary & Performance Metrics
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Detail quantitative benchmarks, chemical composition, efficiency gains, or pilot test results..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !applicant.trim()}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle className="size-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish to Live Radar (IST Top)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
