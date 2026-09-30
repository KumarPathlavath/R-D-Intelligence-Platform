"""
Data Models for Monthly R&D Intelligence Reports
Defines schemas for monthly report generation, 12 report sections,
evidence traceability, technology gaps, and human review workflows.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class SourceEvidence(BaseModel):
    source_name: str
    source_type: str  # peer-reviewed, patent, startup, company, market, policy
    publication_date: str
    url: str
    title: str
    verbatim_excerpt: str = ""
    reliability_tier: str = "High"  # High, Medium, Lower
    reliability_score: float = 0.90
    doi_or_patent_no: Optional[str] = None
    geography: str = "India & Global"
    organization: Optional[str] = None


class MonthlyMetricDelta(BaseModel):
    category: str
    current_count: int
    previous_count: int
    change_pct: float
    trend: str  # 'accelerating', 'growing', 'stable', 'declining', 'new'
    explanation: str


class EmergingTechnologySignal(BaseModel):
    technology_id: str
    technology_name: str
    domain: str
    signal_score: float  # 0.0 to 1.0
    growth_rate_pct: float
    evidence_count: int
    research_activity: str  # '↑', '→', '↓', 'new'
    patent_activity: str
    company_activity: str
    market_activity: str
    policy_activity: str
    why_detected: str
    calculation_breakdown: Dict[str, Any] = Field(default_factory=dict)
    key_organizations: List[str] = Field(default_factory=list)
    primary_sources: List[SourceEvidence] = Field(default_factory=list)


class ImportantDevelopment(BaseModel):
    development_id: str
    title: str
    category: str  # Research, Patent, Company, Startup, Market, Policy
    what_happened: str
    who_involved: List[str] = Field(default_factory=list)
    when_date: str
    technology: str
    market: str
    why_relevant: str
    evidence_sources: List[SourceEvidence] = Field(default_factory=list)
    independent_confirmation_count: int = 1


class TechnologyGapItem(BaseModel):
    gap_id: str
    technology: str
    market_need: str
    technology_activity: str
    observed_limitations: str
    potential_gap: str
    classification_label: str = "Potential gap"  # "Evidence-backed observation", "Potential gap", "Hypothesis requiring validation"
    validation_status: str = "pending_review"  # "pending_review", "approved", "rejected", "edited"
    supporting_evidence: List[SourceEvidence] = Field(default_factory=list)
    reviewer_notes: Optional[str] = None


class MonthlyRDOpportunity(BaseModel):
    opportunity_id: str
    title: str
    problem: str
    technology: str
    potential_gap: str
    existing_approaches: str
    market_relevance: str
    research_relevance: str
    potential_partners: List[str] = Field(default_factory=list)
    technology_maturity: str = "Prototype"  # Early Research, Experimental, Prototype, Pilot, Commercial, Scaled
    unknowns_and_challenges: str
    suggested_investigation: str
    confidence_score: float = 0.88
    review_status: str = "approved"  # approved, pending_review, rejected
    evidence_sources: List[SourceEvidence] = Field(default_factory=list)


class RelationshipNode(BaseModel):
    id: str
    label: str
    node_type: str  # technology, research, patent, startup, company, market, policy
    category: Optional[str] = None


class RelationshipEdge(BaseModel):
    source_id: str
    target_id: str
    relation: str  # develops, patents, applies, regulates, publishes
    weight: float = 1.0


class TechnologyLandscape(BaseModel):
    nodes: List[RelationshipNode] = Field(default_factory=list)
    edges: List[RelationshipEdge] = Field(default_factory=list)
    clusters: List[Dict[str, Any]] = Field(default_factory=list)


class EvidenceCoverageSummary(BaseModel):
    total_sources_analyzed: int
    duplicates_removed: int
    independent_sources: int
    high_reliability_sources: int
    medium_reliability_sources: int
    lower_reliability_sources: int
    by_category: Dict[str, int] = Field(default_factory=dict)
    by_geography: Dict[str, int] = Field(default_factory=dict)


class ReviewActionItem(BaseModel):
    insight_id: str
    action: str  # "approve", "reject", "edit"
    previous_status: str
    new_status: str
    reviewer_notes: Optional[str] = None
    timestamp: str


class MonthlyReportSection(BaseModel):
    section_key: str
    section_number: int
    title: str
    content_summary: str
    data: Dict[str, Any] = Field(default_factory=dict)


class MonthlyReportData(BaseModel):
    report_id: str
    year_month: str  # e.g., "2026-09", "2026-03"
    month_name: str  # e.g., "September 2026", "March 2026"
    generated_at: str
    status: str = "Generated"  # Generated, Draft, Finalized
    executive_summary: List[str] = Field(default_factory=list)
    metrics_delta: List[MonthlyMetricDelta] = Field(default_factory=list)
    emerging_signals: List[EmergingTechnologySignal] = Field(default_factory=list)
    research_developments: List[ImportantDevelopment] = Field(default_factory=list)
    patent_developments: List[ImportantDevelopment] = Field(default_factory=list)
    company_startup_developments: List[ImportantDevelopment] = Field(default_factory=list)
    market_developments: List[ImportantDevelopment] = Field(default_factory=list)
    policy_developments: List[ImportantDevelopment] = Field(default_factory=list)
    technology_gaps: List[TechnologyGapItem] = Field(default_factory=list)
    rd_opportunities: List[MonthlyRDOpportunity] = Field(default_factory=list)
    technology_landscape: TechnologyLandscape = Field(default_factory=TechnologyLandscape)
    evidence_summary: EvidenceCoverageSummary
    researcher_questions: List[str] = Field(default_factory=list)
    raw_sources: List[SourceEvidence] = Field(default_factory=list)
    sections: List[MonthlyReportSection] = Field(default_factory=list)
