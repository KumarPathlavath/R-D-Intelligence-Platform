"""
Core Domain Models for DNP Continuous Technology Intelligence Engine
Defines Pydantic v2 data models for signals, capabilities, gap candidates, and structured India-Japan R&D opportunities.
"""

from __future__ import annotations
from datetime import datetime, timezone, date
from enum import Enum
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, HttpUrl


def get_utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class SourceType(str, Enum):
    PEER_REVIEWED = "peer_reviewed"
    PATENT = "patent"
    PREPRINT = "preprint"
    POLICY = "policy"
    FUNDING = "funding"
    STARTUP = "startup"
    NEWS = "news"


# Source trust weights as defined in Section 3.1
SOURCE_TRUST_WEIGHTS: Dict[str, float] = {
    SourceType.PEER_REVIEWED.value: 1.00,
    SourceType.PATENT.value: 0.90,
    SourceType.POLICY.value: 0.85,
    SourceType.PREPRINT.value: 0.75,
    SourceType.FUNDING.value: 0.65,
    SourceType.STARTUP.value: 0.70,
    SourceType.NEWS.value: 0.40,
}


class SignalType(str, Enum):
    PATENT_CLUSTER = "patent_cluster"
    PAPER_BREAKTHROUGH = "paper_breakthrough"
    POLICY_SHIFT = "policy_shift"
    FUNDING_INFLECTION = "funding_inflection"
    MULTI_SIGNAL_CONVERGENCE = "multi_signal_convergence"
    WHITE_SPACE_EMERGENCE = "white_space_emergence"


class GapType(str, Enum):
    ADJACENT_ENHANCEMENT = "adjacent_enhancement"
    CROSS_DOMAIN_CONVERGENCE = "cross_domain_convergence"
    WHITE_SPACE_FRONTIER = "white_space_frontier"
    POTENTIAL_THREAT = "potential_threat"


class TriageStatus(str, Enum):
    UNREVIEWED = "unreviewed"
    INVESTIGATING = "investigating"
    APPROVED_FOR_POC = "approved_for_poc"
    ARCHIVED = "archived"
    REJECTED = "rejected"


class SupportingSource(BaseModel):
    """Auditable evidence item linking directly to primary source."""
    type: str = Field(..., description="Source type (e.g. patent, paper, funding, policy, news)")
    title: str = Field(..., description="Title of the paper, patent, or announcement")
    url: str = Field(..., description="Direct clickable URL to the primary source")
    date: str = Field(..., description="Publication / announcement date (YYYY-MM-DD)")
    weight: float = Field(..., ge=0.0, le=1.0, description="Trust weight propagated from source provenance")
    author_or_org: Optional[str] = Field(None, description="Authoring institution, company, or inventors (e.g. IIT Madras, IISc, USPTO)")
    geography: Optional[str] = Field("Global", description="Origin geography: India, Japan, USA, Europe, Global")
    excerpt: Optional[str] = Field(None, description="Key sentence or claim supporting this opportunity")


class CapabilityMatch(BaseModel):
    """Adjacency link connecting an external signal/gap to an internal DNP capability."""
    capability_id: str = Field(..., description="ID of the matching internal capability")
    capability_name: str = Field(..., description="Name of the matching internal capability")
    similarity_score: float = Field(..., ge=-1.0, le=1.0, description="Cosine similarity score")
    adjacency_rationale: Optional[str] = Field(None, description="Why this capability is technically adjacent")


class RawSignal(BaseModel):
    """Raw ingested external item before embedding and classification."""
    signal_id: str
    title: str
    raw_text: str
    source_name: str
    source_type: SourceType
    url: str
    publish_date: str
    geography: str = "Global"
    domain_tags: List[str] = Field(default_factory=list)
    trust_weight: float = 0.5
    raw_metadata: Dict[str, Any] = Field(default_factory=dict)
    ingested_at: str = Field(default_factory=get_utc_now_iso)


class ProcessedSignal(BaseModel):
    """Deduplicated, classified, and embedded external signal."""
    signal_id: str
    title: str
    clean_text: str
    source_name: str
    source_type: SourceType
    url: str
    publish_date: str
    geography: str = "Global"
    domain_tags: List[str] = Field(default_factory=list)
    trust_weight: float
    is_change_signal: bool = True
    change_confidence: float = 1.0
    key_entities: List[str] = Field(default_factory=list)
    novelty_score: float = 0.0
    embedding: Optional[List[float]] = None


class Capability(BaseModel):
    """Structured internal organizational capability entry (DNP Core Tech)."""
    capability_id: str
    name: str
    domain: List[str]
    description: str
    dnp_division: Optional[str] = "DNP R&D Headquarters (Japan)"
    key_technical_metrics: Dict[str, Any] = Field(default_factory=dict)
    trl: int = Field(default=8, ge=1, le=9, description="Technology Readiness Level (1-9)")
    active_projects: List[str] = Field(default_factory=list)
    internal_patents: List[str] = Field(default_factory=list)
    embedding: Optional[List[float]] = None
    created_at: Optional[str] = None


class SignalCluster(BaseModel):
    """Cluster of temporally & semantically correlated signals across sources."""
    cluster_id: str
    cluster_label: str
    domain: str
    geography_distribution: Dict[str, int] = Field(default_factory=dict)
    signal_ids: List[str]
    signals: List[ProcessedSignal] = Field(default_factory=list)
    source_type_distribution: Dict[str, int] = Field(default_factory=dict)
    earliest_date: str
    latest_date: str
    time_span_days: int = 0
    cross_source_diversity: float = 0.0
    centroid_similarity_to_capabilities: Dict[str, float] = Field(default_factory=dict)


class OpportunityRecord(BaseModel):
    """
    Structured, auditable R&D opportunity record.
    Connects Indian/Global technology developments with DNP Japan capability teams.
    """
    opportunity_id: str = Field(..., description="Unique opportunity identifier (e.g. opp_00214)")
    title: str = Field(..., description="Actionable title describing the surfaced R&D opportunity")
    domain: str = Field(..., description="Target technology domain(s)")
    geography: str = Field(default="India & Global", description="Origin and application geography")
    first_detected_date: str = Field(..., description="Date the initial signal or cluster was detected")
    signal_type: SignalType = Field(..., description="Primary signal modality")
    supporting_sources: List[SupportingSource] = Field(..., min_length=1, description="Traceable auditable evidence items")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Calibrated confidence score")
    capability_adjacency: List[str] = Field(..., description="List of internal capability_ids closely adjacent to this opportunity")
    capability_matches: List[CapabilityMatch] = Field(default_factory=list, description="Detailed adjacency match objects")
    dnp_division_target: Optional[str] = Field("DNP Functional Materials Division (Japan)", description="Target DNP Japan business unit")
    collaboration_hypothesis: Optional[str] = Field(None, description="Proposed collaboration model (e.g. Joint Lab with IIT/IISc, Startup POC, Tech Transfer)")
    gap_type: GapType = Field(default=GapType.ADJACENT_ENHANCEMENT, description="Classification of the technical gap")
    strategic_rationale: str = Field(..., description="Strategic assessment of why this gap represents high-impact potential for DNP")
    suggested_next_step: str = Field(..., description="Concrete, falsifiable R&D verification step for teams in India and Japan")
    triage_status: TriageStatus = Field(default=TriageStatus.UNREVIEWED, description="Current workflow state")
    researcher_notes: Optional[str] = Field(None, description="Human researcher commentary, lab results, and meeting notes")
    created_at: str = Field(default_factory=get_utc_now_iso)
    updated_at: str = Field(default_factory=get_utc_now_iso)
