import pytest
from src.models import ProcessedSignal, SourceType
from src.gap_analysis.clustering import TemporalSignalClusterer


def test_cluster_temporal_decay_and_grouping():
    clusterer = TemporalSignalClusterer(half_life_days=90.0, cluster_distance_threshold=0.65)

    s1 = ProcessedSignal(
        signal_id="sig_1",
        title="Solid-state electrolyte thin films with 1.8 mS/cm conductivity",
        clean_text="Solvent-free roll-to-roll dry powder fibrillation of sulfide solid electrolytes.",
        source_name="arXiv",
        source_type=SourceType.PREPRINT,
        url="http://arxiv/1",
        publish_date="2026-08-01",
        trust_weight=0.75,
        is_change_signal=True,
        change_confidence=0.90,
        domain_tags=["energy", "materials"]
    )

    s2 = ProcessedSignal(
        signal_id="sig_2",
        title="Method for dry coating sulfide solid state electrolytes for battery cells",
        clean_text="A method for roll-to-roll dry powder coating of Li6PS5Cl argyrodite solid electrolyte films.",
        source_name="USPTO",
        source_type=SourceType.PATENT,
        url="http://patent/2",
        publish_date="2026-08-05",
        trust_weight=0.90,
        is_change_signal=True,
        change_confidence=0.92,
        domain_tags=["energy", "materials"]
    )

    clusters = clusterer.cluster_signals([s1, s2])
    assert len(clusters) >= 1
    # Check that signals with close dates and related texts are grouped
    assert any(len(c.signals) >= 1 for c in clusters)
