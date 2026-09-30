import os
import pytest
from src.pipeline import IntelligenceEnginePipeline
from src.models import TriageStatus


def test_full_pipeline_cycle(tmp_path):
    test_db = str(tmp_path / "test_engine.db")
    pipeline = IntelligenceEnginePipeline(
        db_path=test_db,
        seed_capabilities_path="config/seed_capabilities.json",
        sources_config_path="config/sources.yaml"
    )

    summary = pipeline.run_cycle(limit_per_source=4, verbose=False)

    assert summary["ingested_raw"] > 0
    assert summary["unique_signals"] > 0
    assert summary["change_signals"] > 0
    assert summary["opportunities_surfaced"] > 0

    # Test database persistence and retrieval
    opps = pipeline.db.get_opportunities()
    assert len(opps) == summary["opportunities_surfaced"]

    # Test triage status update
    target_opp = opps[0]
    pipeline.db.update_opportunity_triage(
        target_opp.opportunity_id,
        TriageStatus.INVESTIGATING,
        "Assigning Dr. Smith to review experimental feasibility."
    )

    updated_opps = pipeline.db.get_opportunities(status=TriageStatus.INVESTIGATING)
    assert len(updated_opps) >= 1
    assert updated_opps[0].opportunity_id == target_opp.opportunity_id
    assert updated_opps[0].triage_status == TriageStatus.INVESTIGATING
