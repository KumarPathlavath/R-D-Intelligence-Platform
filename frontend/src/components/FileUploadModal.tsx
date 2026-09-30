import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Clock,
  Share2,
  Folder,
  ChevronRight,
  ChevronLeft,
  Grid,
  List,
  Search,
  Check,
  Upload,
  Sparkles,
  Layers,
  HardDrive,
  Cloud,
  File
} from 'lucide-react';
import { SAMPLE_BROWSER_DOCS } from '../data/mockData';
import { UploadedDoc } from '../types';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoc: (doc: UploadedDoc) => void;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onSelectDoc
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-maths');
  const [activeSidebarItem, setActiveSidebarItem] = useState<string>('downloads');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentDoc =
    SAMPLE_BROWSER_DOCS.find((d) => d.id === selectedDocId) ||
    SAMPLE_BROWSER_DOCS[0];

  const handleOpenSelected = () => {
    if (currentDoc) {
      onSelectDoc(currentDoc);
      onClose();
    }
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      const customDoc: UploadedDoc = {
        id: `custom-${Date.now()}`,
        name: file.name,
        format: file.name.endsWith('.pdf')
          ? 'PDF document'
          : file.name.endsWith('.docx')
          ? 'DOCX document'
          : 'Text document',
        size: `${Math.round(file.size / 1024)} KB`,
        createdDate: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        textContent: content.substring(0, 1000) || `Uploaded document: ${file.name}. Continuous intelligence engine extracted key technical entities for capability matching.`,
        extractedQuery: `Uploaded technical document: ${file.name}. Analyzing capability gap, patent novelty, and research alignment.`
      };
      onSelectDoc(customDoc);
      onClose();
    };

    if (file.type.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.json') || file.name.endsWith('.md')) {
      reader.readAsText(file);
    } else {
      // For binary files like PDF in browser without heavy WASM parser
      const customDoc: UploadedDoc = {
        id: `custom-${Date.now()}`,
        name: file.name,
        format: file.name.endsWith('.pdf') ? 'PDF document' : 'Document',
        size: `${Math.round(file.size / 1024)} KB`,
        createdDate: 'Today at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        textContent: `Document ${file.name} successfully parsed. Analyzing research entities and capability overlap against Indian patents & global databases.`,
        extractedQuery: `${file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]/g, ' ')} capability gap and continuous patent intelligence analysis.`
      };
      onSelectDoc(customDoc);
      onClose();
    }
  };

  const filteredDocs = SAMPLE_BROWSER_DOCS.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      {/* Hidden system file picker for real files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomFileUpload}
        className="hidden"
        accept=".pdf,.txt,.docx,.json,.md,.csv"
      />

      {/* macOS / PatSnap Finder Style Window */}
      <div className="w-full max-w-3xl bg-[#f6f6f6] dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp">
        {/* Window Top Controls & Navigation Bar */}
        <div className="bg-[#e8e8e8] dark:bg-slate-800 px-4 py-2.5 flex items-center justify-between border-b border-slate-300 dark:border-slate-700 select-none">
          {/* macOS Window Dots */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="size-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity flex items-center justify-center text-[8px] text-[#4c0000] font-bold"
              title="Close"
            >
              ×
            </button>
            <div className="size-3 rounded-full bg-[#ffbd2e]" />
            <div className="size-3 rounded-full bg-[#27c93f]" />
          </div>

          {/* Directory Title Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/70 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
            <Folder className="size-3.5 text-blue-500 fill-blue-500" />
            <span>Downloads</span>
            <span className="text-[10px] text-slate-400">⇅</span>
          </div>

          {/* Search Input Box */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 w-44">
            <Search className="size-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="bg-transparent outline-none w-full text-xs placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Finder Content Area (3 Columns: Sidebar | File List | File Preview) */}
        <div className="grid grid-cols-12 flex-1 min-h-[360px] max-h-[460px] bg-white dark:bg-slate-900 divide-x divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
          {/* Left Column: Finder Sidebar (3 Cols) */}
          <div className="col-span-3 bg-[#f3f4f6]/70 dark:bg-slate-900/60 p-3 space-y-4 text-xs select-none overflow-y-auto">
            {/* Recents */}
            <div className="space-y-1">
              <button
                onClick={() => setActiveSidebarItem('recents')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                  activeSidebarItem === 'recents'
                    ? 'bg-blue-100/70 text-blue-700 font-bold dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
                }`}
              >
                <Clock className="size-3.5 text-slate-500" />
                <span>Recents</span>
              </button>

              <button
                onClick={() => setActiveSidebarItem('shared')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left font-medium transition-colors ${
                  activeSidebarItem === 'shared'
                    ? 'bg-blue-100/70 text-blue-700 font-bold dark:bg-blue-900/40 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
                }`}
              >
                <Share2 className="size-3.5 text-slate-500" />
                <span>Shared</span>
              </button>
            </div>

            {/* Favourites */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Favourites
              </span>
              <button
                onClick={() => setActiveSidebarItem('applications')}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 font-medium"
              >
                <Sparkles className="size-3.5 text-blue-500" />
                <span>Applications</span>
              </button>
              <button
                onClick={() => setActiveSidebarItem('desktop')}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 font-medium"
              >
                <HardDrive className="size-3.5 text-slate-500" />
                <span>Desktop</span>
              </button>
              <button
                onClick={() => setActiveSidebarItem('documents')}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 font-medium"
              >
                <FileText className="size-3.5 text-slate-500" />
                <span>Documents</span>
              </button>
              <button
                onClick={() => setActiveSidebarItem('downloads')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left font-bold transition-colors ${
                  activeSidebarItem === 'downloads'
                    ? 'bg-[#10b981]/15 text-[#059669] dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50'
                }`}
              >
                <Folder className="size-3.5 text-[#059669] fill-[#059669]" />
                <span>Downloads</span>
              </button>
            </div>

            {/* Locations */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                Locations
              </span>
              <div className="w-full flex items-center gap-2 px-2 py-1 text-slate-500 text-xs">
                <Cloud className="size-3.5 text-sky-500" />
                <span>iCloud Drive</span>
              </div>
              <div className="w-full flex items-center gap-2 px-2 py-1 text-slate-500 text-xs">
                <HardDrive className="size-3.5 text-slate-500" />
                <span>apple</span>
              </div>
              <div className="w-full flex items-center gap-2 px-2 py-1 text-slate-500 text-xs">
                <HardDrive className="size-3.5 text-slate-500" />
                <span>Macintosh HD</span>
              </div>
            </div>

            {/* Custom local file trigger */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2 px-2.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <Upload className="size-3" />
                <span>Upload From Mac...</span>
              </button>
            </div>
          </div>

          {/* Middle Column: Files List (4 Cols) */}
          <div className="col-span-4 p-2 space-y-3 overflow-y-auto max-h-[380px]">
            <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase">
              July
            </div>

            <div className="space-y-1">
              {filteredDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-[#10b981] text-white font-bold shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <FileText
                      className={`size-4 shrink-0 ${
                        isSelected ? 'text-white' : 'text-red-500'
                      }`}
                    />
                    <div className="truncate flex-1">
                      <p className="truncate leading-snug">{doc.name}</p>
                      <span
                        className={`text-[10px] ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {doc.size}
                      </span>
                    </div>
                    {isSelected && <Check className="size-3.5 shrink-0 text-white" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: File Preview & Metadata (5 Cols) */}
          <div className="col-span-5 p-5 flex flex-col justify-between bg-white dark:bg-slate-900 overflow-y-auto">
            {currentDoc ? (
              <div className="space-y-4">
                {/* Visual Document Mock Page Thumbnail */}
                <div className="mx-auto w-36 h-48 bg-white border border-slate-300 shadow-md rounded p-3 flex flex-col justify-between text-[6px] text-slate-400 select-none overflow-hidden">
                  <div className="space-y-1">
                    <div className="h-1.5 bg-slate-700 rounded w-2/3 mb-2" />
                    <div className="h-1 bg-slate-300 rounded w-full" />
                    <div className="h-1 bg-slate-200 rounded w-4/5" />
                    <div className="h-1 bg-slate-300 rounded w-full" />
                    <div className="h-1 bg-slate-200 rounded w-3/4" />
                    <div className="h-1 bg-slate-300 rounded w-full" />
                  </div>
                  <div className="text-[7px] font-mono font-bold text-slate-500 text-center border-t border-slate-100 pt-1">
                    Continuous Engine v2.4
                  </div>
                </div>

                {/* Metadata Details */}
                <div className="space-y-1 text-center">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {currentDoc.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {currentDoc.format} — {currentDoc.size}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-left">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Information
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDetails(!showDetails)}
                      className="text-blue-600 text-[11px] hover:underline"
                    >
                      {showDetails ? 'Hide' : 'Show More'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Created: <span className="font-mono text-slate-700 dark:text-slate-300">{currentDoc.createdDate}</span>
                  </div>

                  {showDetails && (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] text-slate-600 dark:text-slate-300 space-y-1 border border-slate-200 dark:border-slate-700">
                      <p className="font-semibold text-slate-800 dark:text-slate-100">
                        Content Extraction Preview:
                      </p>
                      <p className="line-clamp-4 italic text-[10px]">
                        "{currentDoc.textContent}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 text-xs my-auto">
                Select a document to preview
              </div>
            )}
          </div>
        </div>

        {/* Window Bottom Actions Bar */}
        <div className="bg-[#e8e8e8] dark:bg-slate-800 px-4 py-3 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Show Options
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleOpenSelected}
              className="px-6 py-1.5 rounded-lg bg-[#27c93f] hover:bg-[#22b337] text-white text-xs font-bold shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Open & Match</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
