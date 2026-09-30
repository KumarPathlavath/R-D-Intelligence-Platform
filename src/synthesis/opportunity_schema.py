"""
Opportunity Record Schema
Re-exports structured Pydantic models for validation and LLM structured generation.
"""

from src.models import (
    OpportunityRecord,
    SupportingSource,
    CapabilityMatch,
    GapType,
    SignalType,
    TriageStatus,
    SOURCE_TRUST_WEIGHTS
)

__all__ = [
    "OpportunityRecord",
    "SupportingSource",
    "CapabilityMatch",
    "GapType",
    "SignalType",
    "TriageStatus",
    "SOURCE_TRUST_WEIGHTS"
]
