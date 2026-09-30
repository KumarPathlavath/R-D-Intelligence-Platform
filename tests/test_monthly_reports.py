"""
Test suite for Monthly R&D Intelligence Report Engine
"""

import pytest
import os
import json
from datetime import datetime
from src.storage.database import DatabaseManager
from src.reports.monthly_report_generator import MonthlyReportGenerator
from src.reports.seed_monthly_data import seed_monthly_raw_signals


@pytest.fixture
def test_db(tmp_path):
    db_file = str(tmp_path / "test_intel.db")
    db = DatabaseManager(db_path=db_file)
    seed_monthly_raw_signals(db)
    return db


def test_available_months(test_db):
    generator = MonthlyReportGenerator(test_db)
    months = generator.get_available_months()
    assert len(months) >= 3
    ym_list = [m["year_month"] for m in months]
    assert "2026-09" in ym_list
    assert "2026-08" in ym_list
    assert "2026-07" in ym_list


def test_monthly_report_generation(test_db):
    generator = MonthlyReportGenerator(test_db)
    report = generator.generate_monthly_report("2026-09", force_regenerate=True)

    assert report.year_month == "2026-09"
    assert report.month_name == "September 2026"
    assert len(report.executive_summary) >= 5
    assert len(report.metrics_delta) >= 3
    assert len(report.emerging_signals) >= 1
    assert len(report.technology_gaps) >= 1
    assert len(report.rd_opportunities) >= 1
    assert len(report.sections) == 12

    # Check evidence traceability
    for gap in report.technology_gaps:
        assert gap.classification_label in ["Evidence-backed observation", "Potential gap", "Hypothesis requiring validation"]
        assert len(gap.supporting_evidence) >= 1
        for ev in gap.supporting_evidence:
            assert ev.url.startswith("http")
            assert ev.reliability_tier in ["High", "Medium", "Lower"]


def test_insight_review_flow(test_db):
    generator = MonthlyReportGenerator(test_db)
    report = generator.generate_monthly_report("2026-09", force_regenerate=True)
    
    first_gap = report.technology_gaps[0]
    gap_id = first_gap.gap_id

    # Approve insight
    res = generator.update_insight_status(
        insight_id=gap_id,
        new_status="approved",
        notes="Scientifically validated by technical committee",
        action="approve"
    )
    assert res["success"] is True
    assert res["new_status"] == "approved"

    # Verify persistent update in database
    saved = generator.get_saved_report("2026-09")
    matched_gap = next((g for g in saved.technology_gaps if g.gap_id == gap_id), None)
    assert matched_gap is not None
    assert matched_gap.validation_status == "approved"


def test_month_comparison(test_db):
    generator = MonthlyReportGenerator(test_db)
    comp = generator.compare_months("2026-09", "2026-08")

    assert comp["month1"]["year_month"] == "2026-09"
    assert comp["month2"]["year_month"] == "2026-08"
    assert len(comp["technology_comparison"]) >= 1
    assert "new_technologies" in comp
    assert "new_opportunities_m1" in comp
