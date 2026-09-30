import React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Database,
  Radio,
  FileText,
  Building2,
  Globe
} from 'lucide-react';

export const OfficialPortalsCard: React.FC = () => {
  const portals = [
    {
      name: 'IP India (IPO / InPASS)',
      authority: 'Controller General of Patents, Designs and Trade Marks',
      url: 'https://ipindia.gov.in/',
      type: 'Patent Registry',
      badge: '90% Trust Weight',
      tagColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300',
      description: 'Indian Patent Advanced Search System, Weekly Patent Gazettes & Official Registry',
      status: 'Live Connected'
    },
    {
      name: 'IRINS INFLIBNET',
      authority: 'Ministry of Education & INFLIBNET Centre',
      url: 'https://irins.inflibnet.ac.in/',
      type: 'Academic Literature',
      badge: '100% Trust Weight',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300',
      description: 'Indian Research Information Network System across IIT Bombay, IIT Madras, IISc & CSIR Labs',
      status: 'Live Connected'
    },
    {
      name: 'Ministry of Heavy Industries (MHI)',
      authority: 'Government of India',
      url: 'https://heavyindustries.gov.in/',
      type: 'Policy & PLI Scheme',
      badge: '85% Trust Weight',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
      description: 'FAME-II/III Directives, Production Linked Incentive (PLI) for Advanced Chemistry Cell (ACC) Batteries',
      status: 'Live Connected'
    },
    {
      name: 'The Gazette of India',
      authority: 'Department of Publication, Government of India',
      url: 'https://egazette.gov.in/',
      type: 'Sovereign Directives',
      badge: '85% Trust Weight',
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300',
      description: 'Official Sovereign Statutory Notifications, Standards & Regulatory Orders',
      status: 'Live Connected'
    },
    {
      name: 'USPTO Open Data Portal',
      authority: 'United States Patent and Trademark Office',
      url: 'https://data.uspto.gov/home',
      type: 'Global Prior Art',
      badge: '90% Trust Weight',
      tagColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950 dark:text-sky-300',
      description: 'Open Data Patent Grants, Global Family Claims & IPC/CPC Classifications',
      status: 'Live Connected'
    }
  ];

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Database className="size-5 text-blue-600" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Authoritative Ingestion Sources & Official Data Portals
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-mono font-bold">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>5 Official Portals Connected & Synchronized</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {portals.map((p, idx) => (
          <a
            key={idx}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:border-blue-300 transition-all space-y-2.5 flex flex-col justify-between group shadow-2xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${p.tagColor}`}>
                  {p.badge}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="size-3" />
                  {p.status}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors flex items-center justify-between">
                <span>{p.name}</span>
                <ExternalLink className="size-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-1" />
              </h3>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {p.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-400 font-mono truncate">
              {p.url}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};
