export type SourceType = 'peer-reviewed' | 'patent' | 'policy' | 'startup' | 'news';

export interface SourceConfig {
  label: string;
  trust: number;
  pill: string;
  ring: string;
  color: string;
}

export interface SignalItem {
  id: string;
  source: SourceType;
  title: string;
  summary: string;
  date: string;
  geography: string;
  origin: string;
  domain: string;
  url?: string;
  noveltyScore?: number;
  applicant?: string;
  categoryBadge?: string;
  timeAgo?: string;
  timestampIST?: string;
  ingestedAt?: string;
  isLive?: boolean;
  itemType?: 'startup_signup' | 'patent_filing' | 'paper_publication' | 'policy_directive' | 'funding_round';
  trustWeight?: number;
}

export interface GeminiConfig {
  configured: boolean;
  key_preview: string;
  model: string;
  timezone: string;
}

export interface RegisterSignalPayload {
  title: string;
  summary?: string;
  source: SourceType;
  domain: string;
  applicant: string;
  geography: string;
  url?: string;
  item_type?: string;
}

export interface CatalogRow {
  id: string;
  signal: string;
  domain: string;
  source: SourceType;
  geography: string;
  date: string;
  metric: string;
  delta: number;
}

export interface BaselineNoveltyItem {
  id: string;
  domain: string;
  leadOrg?: string;
  impact?: string;
  baseline: {
    title: string;
    points: string[];
  };
  novelty: {
    title: string;
    points: string[];
  };
}

export interface EvidenceSource {
  id: string;
  label: string;
  source: SourceType;
  url: string;
  publicationDate: string;
  authority: string;
  confidenceScore: number;
  verbatimQuote: string;
  doiOrPatentNo?: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  capability: string;
  confidence: number;
  rationale: string;
  gapDescription?: string;
  partnership: string;
  labTest: string;
  geography?: string;
  division?: string;
  firstDetected?: string;
  gapType?: string;
  image?: string;
  sources: {
    label: string;
    source: SourceType;
    url?: string;
  }[];
  evidenceDossier?: EvidenceSource[];
  triageStatus?: 'unreviewed' | 'investigating' | 'approved_for_poc' | 'archived' | 'rejected';
}

export interface TrendSpikeTrigger {
  id: string;
  title: string;
  source: SourceType;
  date: string;
  origin: string;
  snippet: string;
  url: string;
  impactScore: number;
}

export interface TrendDataPoint {
  month: string;
  domain: string;
  signalCount: number;
  growthRate: number;
  isSpike?: boolean;
  spikeReason?: string;
  triggerArticles?: TrendSpikeTrigger[];
}

export interface UploadedDoc {
  id: string;
  name: string;
  format: string;
  size: string;
  createdDate: string;
  textContent: string;
  extractedQuery: string;
}

export interface CapabilityItem {
  id: string;
  name: string;
  domains: string[];
  description?: string;
  trl?: number;
  dnp_division?: string;
  key_metrics?: Record<string, string>;
}

export interface AgentItem {
  id: string;
  title: string;
  category: 'Engineering' | 'IP' | 'Life Sciences' | 'Materials' | 'Policy';
  description: string;
  icon: string;
  enabled: boolean;
}

export interface ScheduledTaskTemplate {
  id: string;
  title: string;
  frequency: string;
  sourceTypes: string;
  description: string;
  category: string;
}

export interface ResearcherNote {
  id: string;
  timestamp: string;
  author: string;
  category: string;
  content: string;
}

export interface EngineStats {
  raw_signals: number;
  change_signals: number;
  opportunities: number;
  capabilities: number;
  precision: number;
  f1_score: number;
  lead_time_days: number;
  last_cycle: string;
}

export * from './report';
