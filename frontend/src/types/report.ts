export type ReliabilityTier = 'High' | 'Medium' | 'Lower';

export interface SourceEvidence {
  source_name: string;
  source_type: string;
  publication_date: string;
  url: string;
  title: string;
  verbatim_excerpt: string;
  reliability_tier: ReliabilityTier;
  reliability_score: number;
  doi_or_patent_no?: string;
  geography: string;
  organization?: string;
}

export interface MonthlyMetricDelta {
  category: string;
  current_count: number;
  previous_count: number;
  change_pct: number;
  trend: 'accelerating' | 'growing' | 'stable' | 'declining' | 'new';
  explanation: string;
}

export interface EmergingTechnologySignal {
  technology_id: string;
  technology_name: string;
  domain: string;
  signal_score: number;
  growth_rate_pct: number;
  evidence_count: number;
  research_activity: string;
  patent_activity: string;
  company_activity: string;
  market_activity: string;
  policy_activity: string;
  why_detected: string;
  calculation_breakdown: {
    research_weight?: number;
    patent_weight?: number;
    company_weight?: number;
    policy_weight?: number;
    source_reliability?: number;
    formula?: string;
    [key: string]: any;
  };
  key_organizations: string[];
  primary_sources: SourceEvidence[];
}

export interface ImportantDevelopment {
  development_id: string;
  title: string;
  category: string;
  what_happened: string;
  who_involved: string[];
  when_date: string;
  technology: string;
  market: string;
  why_relevant: string;
  evidence_sources: SourceEvidence[];
  independent_confirmation_count: number;
}

export interface TechnologyGapItem {
  gap_id: string;
  technology: string;
  market_need: string;
  technology_activity: string;
  observed_limitations: string;
  potential_gap: string;
  classification_label: 'Evidence-backed observation' | 'Potential gap' | 'Hypothesis requiring validation';
  validation_status: 'pending_review' | 'approved' | 'rejected' | 'edited';
  supporting_evidence: SourceEvidence[];
  reviewer_notes?: string;
}

export interface MonthlyRDOpportunity {
  opportunity_id: string;
  title: string;
  problem: string;
  technology: string;
  potential_gap: string;
  existing_approaches: string;
  market_relevance: string;
  research_relevance: string;
  potential_partners: string[];
  technology_maturity: 'Early Research' | 'Experimental' | 'Prototype' | 'Pilot' | 'Commercial' | 'Scaled';
  unknowns_and_challenges: string;
  suggested_investigation: string;
  confidence_score: number;
  review_status: 'approved' | 'pending_review' | 'rejected';
  reviewer_notes?: string;
  evidence_sources: SourceEvidence[];
}

export interface RelationshipNode {
  id: string;
  label: string;
  node_type: 'technology' | 'research' | 'patent' | 'startup' | 'company' | 'market' | 'policy';
  category?: string;
}

export interface RelationshipEdge {
  source_id: string;
  target_id: string;
  relation: string;
  weight: number;
}

export interface TechnologyLandscape {
  nodes: RelationshipNode[];
  edges: RelationshipEdge[];
  clusters: { cluster: string; nodes: string[] }[];
}

export interface EvidenceCoverageSummary {
  total_sources_analyzed: number;
  duplicates_removed: number;
  independent_sources: number;
  high_reliability_sources: number;
  medium_reliability_sources: number;
  lower_reliability_sources: number;
  by_category: Record<string, number>;
  by_geography: Record<string, number>;
}

export interface MonthlyReportSection {
  section_key: string;
  section_number: number;
  title: string;
  content_summary: string;
  data: Record<string, any>;
}

export interface MonthlyReportData {
  report_id: string;
  year_month: string;
  month_name: string;
  generated_at: string;
  status: string;
  executive_summary: string[];
  metrics_delta: MonthlyMetricDelta[];
  emerging_signals: EmergingTechnologySignal[];
  research_developments: ImportantDevelopment[];
  patent_developments: ImportantDevelopment[];
  company_startup_developments: ImportantDevelopment[];
  market_developments: ImportantDevelopment[];
  policy_developments: ImportantDevelopment[];
  technology_gaps: TechnologyGapItem[];
  rd_opportunities: MonthlyRDOpportunity[];
  technology_landscape: TechnologyLandscape;
  evidence_summary: EvidenceCoverageSummary;
  researcher_questions: string[];
  raw_sources: SourceEvidence[];
  sections: MonthlyReportSection[];
}

export interface MonthOption {
  year_month: string;
  month_name: string;
  source_count: number;
  status: string;
  generated_at: string;
}

export interface MonthComparisonData {
  month1: {
    year_month: string;
    month_name: string;
    total_sources: number;
    signals_count: number;
    opportunities_count: number;
    gaps_count: number;
  };
  month2: {
    year_month: string;
    month_name: string;
    total_sources: number;
    signals_count: number;
    opportunities_count: number;
    gaps_count: number;
  };
  technology_comparison: {
    technology: string;
    domain: string;
    month1_score: number;
    month2_score: number;
    score_delta: number;
    month1_growth: number;
    month2_growth: number;
    growth_delta: number;
    trend: 'accelerating' | 'growing' | 'stable' | 'declining' | 'new';
  }[];
  new_technologies: string[];
  new_patents_m1: number;
  new_patents_m2: number;
  new_opportunities_m1: string[];
  new_opportunities_m2: string[];
}
