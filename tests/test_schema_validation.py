import pytest
from pydantic import ValidationError
from src.models import (
    OpportunityRecord,
    SupportingSource,
    CapabilityMatch,
    SignalType,
    GapType,
    TriageStatus
)


def test_valid_opportunity_record():
    source = SupportingSource(
        type="patent",
        title="Novel ferrite composition",
        url="https://patents.google.com/patent/1",
        date="2026-08-01",
        weight=0.90,
        author_or_org="Inventors Corp",
        excerpt="Reduced loss by 40%."
    )
    match = CapabilityMatch(
        capability_id="cap_0001",
        capability_name="Sheet-type coil design for wireless power transfer",
        similarity_score=0.82,
        adjacency_rationale="Core magnetic material overlap."
    )
    opp = OpportunityRecord(
        opportunity_id="opp_00001",
        title="Opportunity in Low-loss Ferrite Composites",
        domain="materials",
        first_detected_date="2026-08-01",
        signal_type=SignalType.PATENT_CLUSTER,
        supporting_sources=[source],
        confidence_score=0.85,
        capability_adjacency=["cap_0001"],
        capability_matches=[match],
        gap_type=GapType.ADJACENT_ENHANCEMENT,
        strategic_rationale="High impact adjacent enhancement.",
        suggested_next_step="Synthesize 10 sample discs and measure core loss at 85 kHz.",
        triage_status=TriageStatus.UNREVIEWED
    )
    assert opp.opportunity_id == "opp_00001"
    assert opp.confidence_score == 0.85
    assert len(opp.supporting_sources) == 1


def test_invalid_opportunity_empty_sources():
    with pytest.raises(ValidationError):
        OpportunityRecord(
            opportunity_id="opp_00002",
            title="Invalid Opp Without Sources",
            domain="materials",
            first_detected_date="2026-08-01",
            signal_type=SignalType.PATENT_CLUSTER,
            supporting_sources=[],  # Invalid: min_length=1
            confidence_score=0.85,
            capability_adjacency=["cap_0001"],
            gap_type=GapType.ADJACENT_ENHANCEMENT,
            strategic_rationale="Rationale",
            suggested_next_step="Next step"
        )


def test_invalid_confidence_score_out_of_bounds():
    source = SupportingSource(
        type="paper",
        title="Title",
        url="http://url",
        date="2026-08-01",
        weight=1.0
    )
    with pytest.raises(ValidationError):
        OpportunityRecord(
            opportunity_id="opp_00003",
            title="Invalid Opp",
            domain="materials",
            first_detected_date="2026-08-01",
            signal_type=SignalType.PAPER_BREAKTHROUGH,
            supporting_sources=[source],
            confidence_score=1.5,  # Invalid: le=1.0
            capability_adjacency=["cap_0001"],
            gap_type=GapType.ADJACENT_ENHANCEMENT,
            strategic_rationale="Rationale",
            suggested_next_step="Next step"
        )
