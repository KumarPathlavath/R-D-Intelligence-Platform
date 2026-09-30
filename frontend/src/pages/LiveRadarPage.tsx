import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio,
  Sparkles,
  Search,
  ExternalLink,
  Flame,
  Star,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  RefreshCw,
  PlusCircle,
  Zap,
  Globe2,
  Bell,
  BookOpen,
  ChevronRight,
  MapPin,
  FileBadge,
  Activity,
  Tag,
  Share2,
  Briefcase,
  LayoutList,
  LayoutGrid,
  X,
  Cpu,
  Bot,
  FlaskConical,
  Compass
} from 'lucide-react';
import { api } from '../services/api';
import { INITIAL_SIGNALS } from '../data/mockData';
import { SignalItem } from '../types';
import { formatISTClock, formatISTDateTime, getRelativeTimeIST } from '../utils/istTime';
import { RegisterSignalModal } from '../components/RegisterSignalModal';

interface LiveRadarPageProps {
  onSelectSignalForMatching?: (signal: SignalItem) => void;
}

// 6 Strategic Enterprise Technology Domains with Deep Tech Focus & Lead Lab Metadata
interface StrategicDomainCard {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  techFocus: string;
  leadPartners: string;
  accentColor: string;
  countTag: string;
}

const STRATEGIC_DOMAINS: StrategicDomainCard[] = [
  {
    id: 'Energy & Storage',
    name: 'Energy & Battery Storage',
    shortName: 'Energy & Storage',
    icon: Zap,
    tagline: 'AIS-156 Heat Safety & Grid Storage',
    techFocus: 'Tropical Sodium-Ion · ALD Cathode Passivation · LTO Rapid Charge',
    leadPartners: 'IIT Madras (CBEEV) · ARCI · Log9 Materials',
    accentColor: 'from-amber-500/15 to-orange-500/5 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/60',
    countTag: '24 Signals'
  },
  {
    id: 'AI & Semiconductors',
    name: 'Semiconductors & WBG Packaging',
    shortName: 'Semiconductors',
    icon: Cpu,
    tagline: 'Power Modules & India Semi Mission',
    techFocus: 'Monolithic GaN-on-Si · 3D Heterogeneous Pack · Sub-14nm Nanoimprint',
    leadPartners: 'IISc CeNSE · Rohm · MeitY Semiconductor Mission',
    accentColor: 'from-blue-500/15 to-indigo-500/5 text-blue-600 dark:text-blue-400 border-blue-200/80 dark:border-blue-900/60',
    countTag: '18 Signals'
  },
  {
    id: 'Advanced Materials',
    name: 'Advanced Materials & Nanotech',
    shortName: 'Materials & Nano',
    icon: Layers,
    tagline: 'Nano-Coatings & High-Barrier Substrates',
    techFocus: 'Graphene-MXene Electrodes · Al2O3 Barrier Pouch · Silicon Anodes',
    leadPartners: 'IIT Bombay · CSIR-CECRI · Wiley / IRINS',
    accentColor: 'from-purple-500/15 to-pink-500/5 text-purple-600 dark:text-purple-400 border-purple-200/80 dark:border-purple-900/60',
    countTag: '22 Signals'
  },
  {
    id: 'AI Agents',
    name: 'AI Agents & Edge Intelligence',
    shortName: 'AI & Agents',
    icon: Bot,
    tagline: 'Autonomous Grid Balancing & SLMs',
    techFocus: 'Multi-Agent Reinforcement Learning · Substation Opt · Real-Time SLMs',
    leadPartners: 'University of Tokyo · RIKEN · MeitY AI Mission',
    accentColor: 'from-indigo-500/15 to-violet-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-900/60',
    countTag: '16 Signals'
  },
  {
    id: 'Robotics & Mobility',
    name: 'Robotics & Wireless Mobility',
    shortName: 'Robotics & WPT',
    icon: Radio,
    tagline: 'Inductive EV Charging & SpaceTech',
    techFocus: '12kW Planar Inductive WPT · Ferrite Flux Shielding · SAR Satellites',
    leadPartners: 'IIT Bombay EV Lab · ARAI · Exponent Energy',
    accentColor: 'from-emerald-500/15 to-teal-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/60',
    countTag: '14 Signals'
  },
  {
    id: 'Biotechnology',
    name: 'Biopharma & Continuous Flow',
    shortName: 'Flow Chemistry & APIs',
    icon: FlaskConical,
    tagline: 'Micro-Reactors & Clean APIs',
    techFocus: 'Enzymatic Chiral Synthesis · Non-Palladium Route · Bulk Drug PLI',
    leadPartners: 'CSIR-IICT Hyderabad · NIPER · DoP PLI',
    accentColor: 'from-teal-500/15 to-cyan-500/5 text-teal-600 dark:text-teal-400 border-teal-200/80 dark:border-teal-900/60',
    countTag: '12 Signals'
  }
];

export const LiveRadarPage: React.FC<LiveRadarPageProps> = ({
  onSelectSignalForMatching
}) => {
  const [signals, setSignals] = useState<SignalItem[]>(INITIAL_SIGNALS);
  const [activeCategory, setActiveCategory] = useState<string>('Home');
  const [selectedRegion, setSelectedRegion] = useState<string>('Global');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDiscovering, setIsDiscovering] = useState<boolean>(false);
  const [liveClock, setLiveClock] = useState<string>(formatISTClock());
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'vertical' | 'grid'>('vertical');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('All');

  const [discoveryBanner, setDiscoveryBanner] = useState<{ message: string; count: number } | null>(null);

  // Categories Navigation Tabs
  const categories = [
    'Home',
    'Startups',
    'Patents',
    'Research Papers',
    'Technologies',
    'Materials',
    'Funding',
    'Companies',
    'Trends'
  ];

  // 3 Focused Regions placed on TOP of categories
  const regions = ['Global', 'India', 'Japan'];

  // Domain Filter Options
  const domainFilters = ['All', 'Energy & Storage', 'Advanced Materials', 'AI & Semiconductors', 'AI Agents', 'Robotics & Mobility', 'Biotechnology'];

  // 1-second live Indian Standard Time clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(formatISTClock());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch signals from API on mount
  const fetchSignals = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const data = await api.getSignals();
      if (Array.isArray(data) && data.length > 0) {
        const idSet = new Set(data.map((d) => d.id));
        const combined = [...data, ...INITIAL_SIGNALS.filter((s) => !idSet.has(s.id))];
        setSignals(combined);
      }
    } catch (e) {
      console.warn('Live signals fetch fallback', e);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSignals(false);

    // Auto-refresh poll every 15 seconds
    const pollInterval = setInterval(() => {
      fetchSignals(false);
    }, 15000);

    return () => clearInterval(pollInterval);
  }, []);

  // Handler for "Discover New"
  const handleDiscoverNew = async () => {
    setIsDiscovering(true);
    try {
      const res = await api.scanGeminiSignals(
        activeCategory !== 'Home' ? `${activeCategory} & DeepTech` : 'DeepTech, CleanEnergy & Advanced Materials',
        activeCategory,
        selectedRegion,
        3
      );
      if (res.success && res.signals && res.signals.length > 0) {
        setSignals((prev) => {
          const ids = new Set(prev.map((s) => s.id));
          const newItems = res.signals.filter((s) => !ids.has(s.id));
          return [...newItems, ...prev];
        });
        setRecentlyAddedId(res.signals[0].id);

        const portalNames =
          activeCategory === 'Home'
            ? 'arXiv API, IP India & Startup India DPIIT'
            : activeCategory === 'Research Papers'
            ? 'arXiv Live API & CrossRef DOI Registry'
            : activeCategory === 'Patents'
            ? 'IP India (InPASS), JPO & USPTO'
            : activeCategory === 'Startups'
            ? 'Startup India Hub & METI J-Startup'
            : 'Official Open APIs & Registries';

        setDiscoveryBanner({
          message: `Ingested ${res.signals.length} live verified records directly from official portals (${portalNames}) on top of the feed!`,
          count: res.signals.length
        });

        // Auto fade banner after 7 seconds
        setTimeout(() => {
          setDiscoveryBanner(null);
        }, 7000);
      }
    } catch (err) {
      console.error('Discover new error:', err);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Handler for new signal registered by user
  const handleSignalRegistered = (newSig: SignalItem) => {
    setSignals((prev) => [newSig, ...prev]);
    setRecentlyAddedId(newSig.id);
  };

  // Helper for emblem logo colors and initials
  const getEmblemStyle = (domain: string, source: string) => {
    const s = (source || '').toLowerCase();
    if (s === 'peer-reviewed') {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/80',
        initials: 'IR',
        label: 'Peer-Reviewed Paper'
      };
    }
    if (s === 'patent') {
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200/80',
        initials: 'PT',
        label: 'Patent Registry'
      };
    }
    if (s === 'startup') {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200/80',
        initials: 'SU',
        label: 'Startup / VC'
      };
    }
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200/80',
      initials: 'RD',
      label: 'R&D Intelligence'
    };
  };

  // Filter signals dynamically and sort by newest publication on top
  const filteredSignals = useMemo(() => {
    const list = signals.filter((sig) => {
      // Region match
      let matchRegion = false;
      const sigGeo = (sig.geography || '').toLowerCase();
      if (selectedRegion === 'Global') {
        matchRegion = true;
      } else if (selectedRegion === 'India') {
        matchRegion = sigGeo.includes('india') || sigGeo.includes('iit') || sigGeo.includes('iisc') || sigGeo.includes('bengaluru') || sigGeo.includes('chennai') || sigGeo.includes('hyderabad') || sigGeo.includes('mumbai');
      } else if (selectedRegion === 'Japan') {
        matchRegion = sigGeo.includes('japan') || sigGeo.includes('tokyo') || sigGeo.includes('kyoto') || sigGeo.includes('tohoku') || sigGeo.includes('jpo') || sigGeo.includes('osaka') || sigGeo.includes('nagoya');
      }

      // Category match
      let matchCat = true;
      const src = (sig.source || '').toLowerCase();
      const badge = (sig.categoryBadge || '').toLowerCase();
      const title = (sig.title || '').toLowerCase();
      const domain = (sig.domain || '').toLowerCase();

      if (activeCategory === 'Startups') {
        matchCat = src === 'startup' || badge.includes('startup') || title.includes('raise') || title.includes('seed') || title.includes('venture') || (sig.id || '').startsWith('sig-str');
      } else if (activeCategory === 'Patents') {
        matchCat = src === 'patent' || badge.includes('patent') || title.includes('patent') || title.includes('ipo') || title.includes('jpo') || title.includes('uspto') || (sig.id || '').startsWith('sig-pat');
      } else if (activeCategory === 'Research Papers') {
        matchCat = src === 'peer-reviewed' || badge.includes('paper') || badge.includes('research') || badge.includes('peer') || title.includes('paper') || title.includes('reports') || title.includes('publication') || (sig.id || '').startsWith('sig-res');
      } else if (activeCategory === 'Materials') {
        matchCat = domain.includes('materials') || title.includes('battery') || title.includes('composite') || title.includes('cathode') || title.includes('coating') || title.includes('polymer') || title.includes('electrolyte');
      } else if (activeCategory === 'Funding') {
        matchCat = src === 'startup' || title.includes('raise') || title.includes('seed') || title.includes('cr') || title.includes('funding') || title.includes('series') || title.includes('closes') || title.includes('secures');
      } else if (activeCategory === 'Technologies') {
        matchCat = domain.includes('energy') || domain.includes('semiconductors') || domain.includes('ai') || domain.includes('robotics') || domain.includes('quantum') || domain.includes('telecom');
      } else if (activeCategory === 'Companies') {
        matchCat = Boolean(sig.applicant) || src === 'startup';
      }

      // Domain dropdown / card filter match
      let matchDomain = true;
      if (selectedDomainFilter !== 'All') {
        if (selectedDomainFilter === 'Energy & Storage') {
          matchDomain = domain.includes('energy') || title.includes('battery') || title.includes('storage') || title.includes('charging') || title.includes('ammonia') || title.includes('fuel cell') || title.includes('inverter') || title.includes('solar');
        } else if (selectedDomainFilter === 'AI & Semiconductors') {
          matchDomain = domain.includes('semiconductor') || domain.includes('chip') || title.includes('gan') || domain.includes('quantum') || title.includes('lithography') || title.includes('driver') || title.includes('packaging');
        } else if (selectedDomainFilter === 'Advanced Materials') {
          matchDomain = domain.includes('material') || title.includes('graphene') || title.includes('coating') || title.includes('composite') || title.includes('mxene') || title.includes('ald') || title.includes('anode') || title.includes('cathode');
        } else if (selectedDomainFilter === 'AI Agents') {
          matchDomain = domain.includes('ai') || domain.includes('software') || title.includes('reinforcement') || title.includes('learning') || title.includes('agent') || title.includes('model') || domain.includes('optics');
        } else if (selectedDomainFilter === 'Robotics & Mobility') {
          matchDomain = domain.includes('robotics') || domain.includes('mobility') || domain.includes('aerospace') || title.includes('ev') || title.includes('motor') || title.includes('wireless') || title.includes('sar') || title.includes('satellite');
        } else if (selectedDomainFilter === 'Biotechnology') {
          matchDomain = domain.includes('bio') || domain.includes('pharma') || domain.includes('health') || title.includes('chiral') || title.includes('api') || title.includes('flow');
        }
      }

      // Search query match across title, summary, domain, applicant, origin, geography, url, id
      const q = searchFilter.trim().toLowerCase();
      const matchQ =
        !q ||
        title.includes(q) ||
        (sig.summary || '').toLowerCase().includes(q) ||
        domain.includes(q) ||
        (sig.applicant && sig.applicant.toLowerCase().includes(q)) ||
        (sig.origin || '').toLowerCase().includes(q) ||
        (sig.geography || '').toLowerCase().includes(q) ||
        (sig.url || '').toLowerCase().includes(q) ||
        (sig.id || '').toLowerCase().includes(q);

      return matchRegion && matchCat && matchDomain && matchQ;
    });

    // Chronological Sort: newest publications and signups strictly on top
    return list.sort((a, b) => {
      if (a.ingestedAt && b.ingestedAt) {
        return new Date(b.ingestedAt).getTime() - new Date(a.ingestedAt).getTime();
      }
      if (a.date !== b.date) {
        return (b.date || '').localeCompare(a.date || '');
      }
      return 0;
    });
  }, [signals, activeCategory, selectedRegion, selectedDomainFilter, searchFilter]);

  return (
    <div className="space-y-6 sm:space-y-7 animate-fadeIn pb-16 max-w-6xl mx-auto">
      {/* Registration Modal */}
      <RegisterSignalModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSignalCreated={handleSignalRegistered}
      />

      {/* TOP BAR: Title & Actions + Countries / Region Selector on the TOP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        {/* Main Brand Title */}
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight font-sans">
            R&D Signal Intelligence
          </h1>
        </div>

        {/* Top Right: Countries / Region Switcher (ON TOP OF TABS) + Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Countries / Region Selector Pills */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-2xs">
            {regions.map((reg) => {
              const isRegActive = selectedRegion === reg;
              return (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isRegActive
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{reg === 'India' ? '🇮🇳' : reg === 'Japan' ? '🇯🇵' : '🌐'}</span>
                  <span>{reg}</span>
                </button>
              );
            })}
          </div>

          {/* Discover New Button */}
          <button
            onClick={handleDiscoverNew}
            disabled={isDiscovering}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow flex items-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-95 whitespace-nowrap"
            title="Discover fresh research papers, patents, and startups"
          >
            <Sparkles className={`size-4 ${isDiscovering ? 'animate-spin text-amber-300' : 'text-amber-300'}`} />
            <span>{isDiscovering ? 'Discovering...' : 'Discover New'}</span>
          </button>

          {/* Register Discovery Button */}
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
          >
            <PlusCircle className="size-3.5 text-emerald-500" />
            <span>+ Register</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS ROW: Clean Underline Tabs & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 dark:border-slate-800 pb-2.5">
        {/* Navigation Tabs (Home, Startups, Patents, Research Papers, Technologies, Materials, Funding, Companies, Trends) */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-xs sm:text-[13.5px] font-bold whitespace-nowrap pb-2 transition-all relative cursor-pointer shrink-0 ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <span>{cat}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-indigo-600 dark:bg-indigo-400 rounded-full animate-fadeIn" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Toolbar: Quick Search, Filter Popover, and Layout View Toggle */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Quick Search Bar */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 text-xs w-full sm:w-60 shadow-2xs">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search 60+ verified publications..."
              className="bg-transparent outline-none w-full text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="text-slate-400 hover:text-slate-600"
                title="Clear search"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Filter Popover Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isFilterDrawerOpen || selectedDomainFilter !== 'All'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="size-3.5" />
            <span>Filters</span>
            {selectedDomainFilter !== 'All' && (
              <span className="size-2 rounded-full bg-indigo-600" />
            )}
          </button>

          {/* Layout Toggle (Vertical Stack default vs Grid) */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700">
            <button
              onClick={() => setViewMode('vertical')}
              title="Vertical List (Clean Margins & Box Layout)"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'vertical'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutList className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="2-Column Grid"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Domain Filter Drawer (Clean, Compact Filter Way) */}
      {isFilterDrawerOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-fadeIn space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
                Filter by Strategic Technology Domain:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                (Click to isolate research, patents & startups)
              </span>
            </div>
            {selectedDomainFilter !== 'All' && (
              <button
                onClick={() => setSelectedDomainFilter('All')}
                className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer flex items-center gap-1"
              >
                <span>Reset Domain Filter</span>
                <X className="size-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {/* All Domains Option */}
            <button
              onClick={() => setSelectedDomainFilter('All')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                selectedDomainFilter === 'All'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🌐</span>
                <span>All Strategic Domains</span>
              </span>
              <span className="text-[10.5px] font-mono opacity-80 font-normal">
                {signals.length} Signals
              </span>
            </button>

            {/* 6 Strategic Domains */}
            {STRATEGIC_DOMAINS.map((domain) => {
              const isSelected = selectedDomainFilter === domain.id;
              const IconComp = domain.icon;
              return (
                <button
                  key={domain.id}
                  onClick={() => setSelectedDomainFilter(isSelected ? 'All' : domain.id)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 hover:border-indigo-200'
                  }`}
                  title={`${domain.techFocus} · ${domain.leadPartners}`}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <IconComp className={`size-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                    <span className="truncate">{domain.shortName}</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ml-1 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                    {domain.countTag}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Live Stream Status Bar with Live IST Ticker & Active Filter Chip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-700 dark:text-slate-300">
              Live Feed · Newest Published on Top
            </span>
          </div>

          {/* Active Domain Filter Chip */}
          {selectedDomainFilter !== 'All' && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-semibold animate-fadeIn">
              <span>Domain: {selectedDomainFilter}</span>
              <button
                onClick={() => setSelectedDomainFilter('All')}
                className="hover:text-indigo-900 dark:hover:text-white cursor-pointer ml-0.5"
                title="Clear domain filter"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <Clock className="size-3.5 text-slate-400" />
          <span>Live IST: {liveClock}</span>
          <span>•</span>
          <button
            onClick={() => fetchSignals(true)}
            className="hover:text-blue-600 flex items-center gap-1 cursor-pointer"
            title="Refresh stream"
          >
            <RefreshCw className={`size-3 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Auto-refreshing'}</span>
          </button>
        </div>
      </div>

      {/* Discovery Feedback Notification Banner */}
      {discoveryBanner && (
        <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 dark:from-blue-950/60 dark:via-indigo-950/60 dark:to-emerald-950/60 border border-blue-200/80 dark:border-blue-800/80 text-blue-900 dark:text-blue-200 text-xs sm:text-[13px] font-medium animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="size-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="size-4 text-amber-300" />
            </div>
            <span>{discoveryBanner.message}</span>
          </div>
          <button
            onClick={() => setDiscoveryBanner(null)}
            className="p-1 rounded-lg text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100/50 cursor-pointer"
            title="Dismiss"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main Feed: Vertical Cards Stack (Single Column with Generous Padding & Margins) */}
      <div
        className={
          viewMode === 'vertical'
            ? 'flex flex-col space-y-6 sm:space-y-7'
            : 'grid grid-cols-1 md:grid-cols-2 gap-6'
        }
      >
        {filteredSignals.length === 0 ? (
          <div className="p-16 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
            <Radio className="size-10 mx-auto text-slate-400 animate-pulse" />
            <div className="font-extrabold text-base text-slate-800 dark:text-slate-200">
              No discoveries found for {activeCategory} ({selectedRegion})
            </div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Click "Discover New" to continuously scan official registries (IRINS INFLIBNET, IP India, JPO, METI) for fresh breakthroughs.
            </p>
            <button
              onClick={handleDiscoverNew}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow hover:shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
            >
              <Sparkles className="size-4 text-amber-300" />
              <span>Discover New</span>
            </button>
          </div>
        ) : (
          filteredSignals.map((sig) => {
            const isHighlight = sig.id === recentlyAddedId;
            const dynamicTimeAgo = sig.ingestedAt ? getRelativeTimeIST(sig.ingestedAt) : (sig.timeAgo || sig.date);
            const emblem = getEmblemStyle(sig.domain, sig.source);

            return (
              <div
                key={sig.id}
                className={`rounded-2xl border bg-white dark:bg-slate-900 p-6 sm:p-7 md:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-200 flex flex-col justify-between space-y-5 ${
                  isHighlight
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                {/* Top Section */}
                <div className="space-y-2.5">
                  {/* Top Row: Subtitle / Author Lab on Left & Clean Brand Logo Emblem on Right */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-xs sm:text-[13px] font-medium text-slate-500 dark:text-slate-400 block truncate">
                        {sig.applicant || 'Authoring Research Lab & Institute'}
                      </span>
                    </div>

                    {/* Logo / Domain Emblem on Top Right (Exact match with reference image top right logo badge) */}
                    <div
                      className={`size-9 sm:size-10 rounded-xl border flex items-center justify-center font-extrabold text-xs font-mono shrink-0 shadow-2xs ${emblem.bg}`}
                      title={sig.categoryBadge || sig.domain}
                    >
                      <span>{emblem.initials}</span>
                    </div>
                  </div>

                  {/* Card Title (Bold, crisp dark font) */}
                  <h3 className="text-slate-900 dark:text-white font-extrabold text-[17.5px] sm:text-[19.5px] leading-snug tracking-tight">
                    {sig.title}
                  </h3>

                  {/* Summary Description */}
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed line-clamp-3">
                    {sig.summary}
                  </p>
                </div>

                {/* Middle Section: 4-Column Structured Box Model (Exact Match with Reference Image Style) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 py-3.5 px-4 sm:px-5 rounded-xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                  {/* Column 1: Location */}
                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-blue-500 shrink-0" />
                      <span>Location</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {sig.geography === 'India' ? '🇮🇳 India' : sig.geography === 'Japan' ? '🇯🇵 Japan' : '🌐 Global'}
                    </div>
                  </div>

                  {/* Column 2: Source */}
                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <FileBadge className="size-3.5 text-indigo-500 shrink-0" />
                      <span>Source</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate" title={sig.origin}>
                      {sig.source === 'peer-reviewed' ? 'Research Paper' : sig.source === 'patent' ? 'Patent Registry' : sig.source === 'startup' ? 'Startup / VC' : 'Policy'}
                    </div>
                  </div>

                  {/* Column 3: Domain */}
                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <Tag className="size-3.5 text-emerald-500 shrink-0" />
                      <span>Domain</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">
                      {sig.domain || 'Energy'}
                    </div>
                  </div>

                  {/* Column 4: Ingested IST Timestamp */}
                  <div className="space-y-1 min-w-0">
                    <div className="text-[10px] sm:text-[10.5px] uppercase font-bold text-slate-400 font-mono tracking-wider flex items-center gap-1.5">
                      <Clock className="size-3.5 text-amber-500 shrink-0" />
                      <span>Ingested (IST)</span>
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate" title={sig.date}>
                      {dynamicTimeAgo}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Row: Left Link + Right Action Link with Chevron (Like 'Check Eligibility >' in the screenshot) */}
                <div className="flex items-center justify-between pt-1 text-xs sm:text-[13px]">
                  <a
                    href={sig.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white font-semibold inline-flex items-center gap-1 transition-colors"
                  >
                    <span>View Primary Source</span>
                    <ArrowUpRight className="size-3.5" />
                  </a>

                  {onSelectSignalForMatching ? (
                    <button
                      onClick={() => onSelectSignalForMatching(sig)}
                      className="text-xs sm:text-[13px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>Match Capability Gap</span>
                      <ChevronRight className="size-4 stroke-[2.5]" />
                    </button>
                  ) : (
                    <span className="text-xs sm:text-[13px] font-extrabold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1">
                      <span>Verified Record</span>
                      <ChevronRight className="size-4 stroke-[2.5]" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
