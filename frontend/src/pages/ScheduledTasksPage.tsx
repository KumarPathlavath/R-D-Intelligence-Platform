import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  MessageSquare,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Radio,
  Bell,
  RefreshCw,
  X
} from 'lucide-react';
import { INITIAL_SCHEDULED_TEMPLATES } from '../data/mockData';
import { ScheduledTaskTemplate } from '../types';

export const ScheduledTasksPage: React.FC = () => {
  const [activeTasks, setActiveTasks] = useState([
    {
      id: 'task-1',
      title: 'Indian Lithium & Sodium Battery Preprints (IIT/IISc) Monitor',
      frequency: 'Daily at 06:00 UTC',
      status: 'Active',
      lastRun: '4 hours ago',
      sources: 'arXiv, Journal of Power Sources, IPO'
    },
    {
      id: 'task-2',
      title: 'MeitY Semiconductor Mission & PLI Capital Tranches',
      frequency: 'Weekly on Mondays',
      status: 'Active',
      lastRun: '1 day ago',
      sources: 'MeitY Gazettes, PIB India'
    }
  ]);

  const [modalTemplate, setModalTemplate] = useState<ScheduledTaskTemplate | null>(null);
  const [modalFrequency, setModalFrequency] = useState('Weekly');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTemplate) return;

    const newTask = {
      id: `task-${Date.now()}`,
      title: modalTemplate.title,
      frequency: `${modalFrequency} automated scan`,
      status: 'Active',
      lastRun: 'Just scheduled',
      sources: modalTemplate.sourceTypes
    };

    setActiveTasks([newTask, ...activeTasks]);
    setModalTemplate(null);
    setToastMsg(`Successfully scheduled automated scan: "${modalTemplate.title}"`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-blue-600 text-white px-4 py-3 shadow-lg flex items-center gap-2 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="size-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-[#0f172a] tracking-tight">
            Scheduled tasks
          </h1>
          <p className="text-sm text-[#64748b]">
            I can run configured tasks on schedule or whenever you need.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalTemplate(INITIAL_SCHEDULED_TEMPLATES[0])}
          className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>Create continuous task</span>
        </button>
      </div>

      {/* Central Empty / Hero State Banner matching Screenshot 3 */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-4 shadow-sm">
        <div className="size-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="size-8" />
        </div>

        <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          I can run specified tasks on a schedule or whenever you need them. You can also describe a scheduled task in chat or pick a template below.
        </p>

        <div>
          <button
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            <MessageSquare className="size-4 text-blue-600" />
            <span>What can scheduled tasks do?</span>
          </button>
        </div>
      </div>

      {/* Active Scheduled Monitors List */}
      {activeTasks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
            <span>Active Automated Monitors ({activeTasks.length})</span>
            <span className="text-emerald-600 flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Pulse
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {activeTasks.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
                    ● {t.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{t.frequency}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900">{t.title}</h3>
                <div className="text-xs text-slate-500 font-mono">
                  Sources: {t.sources} · Last run: {t.lastRun}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* "Start from a template" Section matching Screenshot 3 */}
      <div className="space-y-4 pt-2">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a]">
            Start from a template
          </h2>
          <p className="text-xs text-[#64748b]">
            Create scheduled updates from common R&D scenarios
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INITIAL_SCHEDULED_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-400 hover:shadow transition-all duration-200 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Radio className="size-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {tmpl.title}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {tmpl.frequency}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[180px]">
                    {tmpl.sourceTypes}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalTemplate(tmpl)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer group"
                >
                  <span>Use template</span>
                  <ArrowUpRight className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Configuration Modal */}
      {modalTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Schedule Continuous Radar
              </h3>
              <button
                onClick={() => setModalTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Task Title:
                </label>
                <input
                  type="text"
                  defaultValue={modalTemplate.title}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Scanning Frequency:
                </label>
                <select
                  value={modalFrequency}
                  onChange={(e) => setModalFrequency(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Daily">Daily (Every morning at 06:00 UTC)</option>
                  <option value="Weekly">Weekly (Every Monday)</option>
                  <option value="Real-Time Trigger">Real-Time Ingestion Trigger</option>
                  <option value="Monthly">Monthly Digest</option>
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600">
                <strong>Ingestion Sources:</strong> {modalTemplate.sourceTypes} (Indian Patent Office, IITs/IISc preprints, MeitY PLI Gazettes)
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTemplate(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow"
                >
                  Start Continuous Monitor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
