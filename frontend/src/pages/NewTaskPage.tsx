import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Paperclip,
  FileText,
  X,
  ShieldCheck,
  Building2,
  BookOpen,
  FileBadge,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Trash2,
  Tag,
  Clock,
  ExternalLink,
  Layers,
  FlaskConical,
  Handshake,
  Search,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Zap,
  Globe2
} from 'lucide-react';
import { api } from '../services/api';
import { SignalItem, OpportunityItem, UploadedDoc } from '../types';
import { formatISTClock, formatISTDateTime, getRelativeTimeIST } from '../utils/istTime';
import { EvidenceModal } from '../components/EvidenceModal';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachedDoc?: {
    name: string;
    size: string;
    format: string;
    textSnippet?: string;
  };
  noveltyScore?: number;
  verdict?: string;
  signals?: SignalItem[];
  opportunities?: OpportunityItem[];
  model?: string;
}

interface NewTaskPageProps {
  initialQuery?: string;
  onNavigateToTab?: (tab: string) => void;
  onSelectSignalForMatching?: (signal: SignalItem) => void;
}

export const NewTaskPage: React.FC<NewTaskPageProps> = ({
  initialQuery = '',
  onNavigateToTab,
  onSelectSignalForMatching
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>(initialQuery);
  const [selectedFocus, setSelectedFocus] = useState<string>('all');
  const [attachedDoc, setAttachedDoc] = useState<{
    name: string;
    size: string;
    format: string;
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedOppForEvidence, setSelectedOppForEvidence] = useState<OpportunityItem | null>(null);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Starter Prompts for Quick Action
  const quickPrompts = [
    {
      title: '🔬 Check Patent Novelty (India & Japan)',
      prompt: 'Check if there is patent novelty for ALD alumina passivation on sodium-ion battery cathode at 55°C ambient heat in India and Japan.'
    },
    {
      title: '📜 Overlapping Prior Art Claims',
      prompt: 'Find prior art patents and claims on EV wireless charging sheet-coil geometry with low magnetic flux leakage.'
    },
    {
      title: '🧪 Research Papers & Breakthroughs',
      prompt: 'Search latest research papers from IIT Madras, IISc CeNSE and Univ of Tokyo in wide-bandgap GaN power packaging.'
    },
    {
      title: '⚡ Match Capability Gap & Lab Protocol',
      prompt: 'Analyze continuous-flow enzymatic reactor replacing palladium catalyst in chiral synthesis and formulate a validation lab test.'
    }
  ];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Initial Query if passed
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  // Handle Local File Upload from Laptop / MacBook
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    let extractedText = '';
    try {
      if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.csv') || file.name.endsWith('.md')) {
        extractedText = await file.text();
      } else {
        const arrayBuf = await file.arrayBuffer();
        const decoder = new TextDecoder('latin1');
        const rawStr = decoder.decode(arrayBuf.slice(0, 15000));
        const words = rawStr.match(/[A-Za-z0-9_-]{3,}/g) || [];
        extractedText = words.slice(0, 180).join(' ');
      }
    } catch {
      extractedText = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ');
    }

    const docData = {
      name: file.name,
      size: sizeFormatted,
      format: file.name.split('.').pop()?.toUpperCase() || 'DOC',
      text: extractedText.trim() || `${file.name} technical document for patent novelty analysis`
    };

    setAttachedDoc(docData);
    setIsLoading(false);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = (promptOverride || inputPrompt).trim();
    if (!textToSend && !attachedDoc) return;

    const userMsgId = `user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: textToSend || `Analyze attached document: "${attachedDoc?.name}" for patent novelty, research prior art, and capability gaps.`,
      timestamp: formatISTClock(),
      attachedDoc: attachedDoc ? {
        name: attachedDoc.name,
        size: attachedDoc.size,
        format: attachedDoc.format,
        textSnippet: attachedDoc.text.slice(0, 140)
      } : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    const currentDoc = attachedDoc;
    setAttachedDoc(null);
    setIsLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const res = await api.chatWithEngine(
        userMessage.content,
        historyPayload,
        currentDoc ? { name: currentDoc.name, text: currentDoc.text } : null,
        selectedFocus
      );

      const aiMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        timestamp: formatISTClock(),
        noveltyScore: res.novelty_score,
        verdict: res.verdict,
        signals: res.signals,
        opportunities: res.opportunities,
        model: res.model
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: '⚠️ An error occurred while communicating with the intelligence engine. Please try again.',
          timestamp: formatISTClock()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `### 🔄 New Intelligence Session Started

Upload any **Patent Claim draft**, **Technical Paper**, or ask an open-ended technical inquiry. I will check **Patent Novelty**, **Prior Art**, **IIT/Japan Academic Literature**, and **Capability Gaps**.`,
        timestamp: formatISTClock(),
        model: 'Google Gemini 2.0 Flash / Live R&D Engine'
      }
    ]);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-5xl mx-auto">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f);
        }}
        className="hidden"
        accept=".pdf,.txt,.docx,.doc,.csv,.json,.md,.png,.jpg"
      />

      {/* Evidence Modal */}
      <EvidenceModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        opportunity={selectedOppForEvidence}
      />

      {/* Chat Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-slate-200/90 dark:border-slate-800 pb-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] dark:text-white tracking-tight font-sans">
              R&D Intelligence & Patent Novelty Copilot
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Powered by Google Gemini 2.0 & Continuous Patent Ingestion (IP India, JPO Japan & IITs/IISc)
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleClearChat}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Start a fresh chat conversation"
          >
            <Trash2 className="size-3.5 text-slate-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.prompt)}
            className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 text-left transition-all cursor-pointer shadow-2xs group flex items-start justify-between gap-2"
          >
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block">
                {qp.title}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {qp.prompt}
              </span>
            </div>
            <ArrowUpRight className="size-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5" />
          </button>
        ))}
      </div>

      {/* Chat Stream Conversation Container */}
      <div className="space-y-6 min-h-[420px]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="size-8.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-1">
                  <Sparkles className="size-4 text-white" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-5 sm:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-tl-xs'
                }`}
              >
                {/* User Attached Document Badge */}
                {msg.attachedDoc && (
                  <div className="p-2.5 rounded-xl bg-indigo-700/80 border border-indigo-400/40 text-xs flex items-center gap-2.5 text-white">
                    <FileText className="size-4 text-amber-300 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold truncate block">{msg.attachedDoc.name}</span>
                      <span className="text-[10px] text-indigo-200 font-mono">
                        {msg.attachedDoc.format} · {msg.attachedDoc.size}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message Header for Assistant */}
                {!isUser && msg.noveltyScore && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" />
                        <span>Novelty Score: {msg.noveltyScore}%</span>
                      </span>

                      {msg.verdict && (
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          • {msg.verdict}
                        </span>
                      )}
                    </div>

                    <span className="text-[10.5px] font-mono text-slate-400">
                      {msg.model || 'Google Gemini 2.0 Flash'}
                    </span>
                  </div>
                )}

                {/* Message Text Content */}
                <div
                  className={`text-xs sm:text-[13.5px] leading-relaxed space-y-3 prose dark:prose-invert max-w-none ${
                    isUser ? 'text-white' : 'text-slate-800 dark:text-slate-200'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.content}
                </div>

                {/* Structured Evidence Signals inside Assistant Response */}
                {!isUser && msg.signals && msg.signals.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <FileBadge className="size-3.5 text-indigo-500" />
                        <span>Relevant Patents & Research Papers Ingested:</span>
                      </span>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {msg.signals.map((sig) => (
                        <div
                          key={sig.id}
                          className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/40 p-4 space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-mono">
                              <span className="font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                                {sig.source === 'peer-reviewed' ? '🔬 Research Paper' : '📜 Patent Filing'}
                              </span>
                              <span className="text-slate-400">{sig.geography}</span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                              {sig.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {sig.summary}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                            <span className="text-[10.5px] font-mono text-slate-400 truncate max-w-[140px]">
                              {sig.origin}
                            </span>
                            <a
                              href={sig.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold inline-flex items-center gap-1 text-[11px]"
                            >
                              <span>View Source</span>
                              <ArrowUpRight className="size-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Structured Opportunities inside Assistant Response */}
                {!isUser && msg.opportunities && msg.opportunities.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="size-3.5 text-emerald-500" />
                      <span>Synthesized Capability Gap & Lab Protocol:</span>
                    </span>

                    {msg.opportunities.map((opp) => (
                      <div
                        key={opp.id}
                        className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-800/40 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {opp.title}
                          </span>
                          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-100/70 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                            {opp.confidence}% Match
                          </span>
                        </div>

                        {opp.gapDescription && (
                          <div className="p-2.5 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 text-[11.5px] text-slate-800 dark:text-slate-200">
                            <span className="font-bold text-amber-800 dark:text-amber-400 font-mono uppercase text-[10px] block">
                              Exact Market Gap:
                            </span>
                            {opp.gapDescription}
                          </div>
                        )}

                        <div className="grid gap-2 sm:grid-cols-2 text-xs">
                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 space-y-1">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono uppercase text-[10px] flex items-center gap-1">
                              <Handshake className="size-3" /> Proposed Partner:
                            </span>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              {opp.partnership}
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 space-y-1">
                            <span className="font-bold text-purple-700 dark:text-purple-400 font-mono uppercase text-[10px] flex items-center gap-1">
                              <FlaskConical className="size-3" /> Actionable Lab Test:
                            </span>
                            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                              {opp.labTest}
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => {
                              setSelectedOppForEvidence(opp);
                              setIsEvidenceModalOpen(true);
                            }}
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Inspect Full Evidence Dossier</span>
                            <ChevronRight className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamp Footer */}
                <div className={`text-[10px] font-mono ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner / Streaming Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm animate-pulse max-w-lg">
            <div className="size-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="size-4 animate-spin text-amber-300" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Checking Patent Novelty & Literature with Gemini...
              </div>
              <div className="text-[10.5px] text-slate-400 font-mono">
                Scanning IP India, JPO Japan, IRINS INFLIBNET & Capability Store
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* DOCKED INPUT BAR WITH FILE UPLOADER & PROMPT INPUT */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`sticky bottom-4 z-20 rounded-2xl border bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] space-y-3 transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-4 ring-indigo-100'
            : 'border-slate-200/90 dark:border-slate-800'
        }`}
      >
        {/* Attached Document Chip Preview */}
        {attachedDoc && (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 animate-fadeIn">
            <FileText className="size-4 text-emerald-600 shrink-0" />
            <span className="font-bold truncate max-w-xs">{attachedDoc.name}</span>
            <span className="text-[10px] text-emerald-600 font-mono">({attachedDoc.size})</span>
            <span className="text-[10px] bg-emerald-200/70 dark:bg-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
              Ready to Analyze
            </span>
            <button
              onClick={() => setAttachedDoc(null)}
              className="p-0.5 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors ml-1 cursor-pointer"
              title="Remove document"
            >
              <X className="size-3.5 text-emerald-700 dark:text-emerald-300" />
            </button>
          </div>
        )}

        {/* Text Input Row */}
        <div className="flex items-end gap-2.5">
          {/* Paperclip Button for Native File Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shrink-0"
            title="Attach technical document, patent draft (.pdf, .docx, .txt, .csv) from your MacBook / laptop"
          >
            <Paperclip className="size-4.5" />
          </button>

          {/* Textarea */}
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={2}
            placeholder={
              attachedDoc
                ? `Ask anything about "${attachedDoc.name}" (e.g. Check patent novelty, prior art claims, or capability gap)...`
                : 'Upload document or ask: "Check if there is patent novelty for this sodium-ion battery cathode in India & Japan"...'
            }
            className="w-full bg-transparent text-xs sm:text-[13.5px] outline-none placeholder:text-slate-400 text-slate-900 dark:text-white resize-none leading-relaxed min-h-[44px]"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={isLoading || (!inputPrompt.trim() && !attachedDoc)}
            className="size-10 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:pointer-events-none text-white flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0 active:scale-95"
            title="Send prompt to Gemini AI"
          >
            <Send className="size-4" />
          </button>
        </div>

        {/* Bottom Helper Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-500" />
            <span>Google Gemini 2.0 Flash Engine Active</span>
            <span>•</span>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          <div>
            <span>Drop file anywhere to attach</span>
          </div>
        </div>
      </div>
    </div>
  );
};
