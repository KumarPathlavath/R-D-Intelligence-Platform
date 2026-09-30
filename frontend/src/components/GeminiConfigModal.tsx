import React, { useState, useEffect } from 'react';
import { Sparkles, Key, CheckCircle2, AlertCircle, X, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { api } from '../services/api';
import { GeminiConfig } from '../types';

interface GeminiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const GeminiConfigModal: React.FC<GeminiConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated
}) => {
  const [config, setConfig] = useState<GeminiConfig | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getGeminiConfig().then((cfg) => {
        setConfig(cfg);
        setStatusMsg(null);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setIsSaving(true);
    setStatusMsg(null);

    const res = await api.setGeminiApiKey(apiKeyInput.trim());
    setIsSaving(false);

    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Gemini API Key activated successfully! Real-time AI stream connected.' });
      setApiKeyInput('');
      const updated = await api.getGeminiConfig();
      setConfig(updated);
      if (onConfigUpdated) onConfigUpdated();
    } else {
      setStatusMsg({ type: 'error', text: res.message || 'Failed to connect with Gemini API.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="size-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="size-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Google Gemini 2.0 / 1.5 Intelligence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live R&D Scouting, Startup Discovery & Patent Extraction Engine
            </p>
          </div>
        </div>

        {/* Current Status Pill */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Engine Status</div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${config?.configured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{config?.configured ? 'Connected to Google Gemini API' : 'Active (Hybrid Verifiable Ingestion)'}</span>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
            {config?.model || 'gemini-2.0-flash'}
          </span>
        </div>

        {/* Form to enter Gemini API Key */}
        <form onSubmit={handleSaveKey} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Key className="size-3.5 text-blue-500" />
                Google Gemini API Key
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5"
              >
                <span>Get key from Google AI Studio</span>
                <ExternalLink className="size-3" />
              </a>
            </label>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={config?.configured ? `Configured (${config.key_preview}) — Paste new key to update` : 'AIzaSy...'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-mono text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={isSaving || !apiKeyInput.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="size-3.5" />
              <span>{isSaving ? 'Connecting...' : 'Save & Activate Key'}</span>
            </button>
          </div>
        </form>

        {/* Enterprise Value Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-emerald-500" />
            Enterprise Strategic Intelligence Grounding
          </div>
          <p>
            The intelligence engine actively queries Indian Patent Office (InPASS), IRINS INFLIBNET (IITs/IISc), MeitY Gazettes, and USPTO Open Data to rank discoveries by trust weight and capability fit.
          </p>
        </div>
      </div>
    </div>
  );
};
