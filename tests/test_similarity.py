import pytest
from src.models import Capability, ProcessedSignal, SourceType, GapType
from src.capability.capability_store import CapabilityStore
from src.gap_analysis.similarity import GapAnalyzer
from src.detection.embed import EmbeddingEngine


def test_cosine_similarity_identical_and_orthogonal():
    engine = EmbeddingEngine(use_local_fallback=True)
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]

    assert pytest.approx(engine.cosine_similarity(v1, v2), 0.001) == 1.0
    assert pytest.approx(engine.cosine_similarity(v1, v3), 0.001) == 0.0


def test_gap_analyzer_adjacent_mapping():
    engine = EmbeddingEngine()
    store = CapabilityStore(seed_path="config/seed_capabilities.json", embed_engine=engine)
    analyzer = GapAnalyzer(capability_store=store, embed_engine=engine, adjacent_threshold=0.45, convergence_threshold=0.30)

    signal = ProcessedSignal(
        signal_id="sig_battery_pouch",
        title="Multi-layer barrier film with plasma-enhanced atomic layer deposited Al2O3 for tropical EV battery packaging",
        clean_text="A multi-layer aluminum laminate barrier pouch film for lithium-ion battery cells preventing moisture ingress and HF acid degradation under high ambient temperature.",
        source_name="Indian Patent Office",
        source_type=SourceType.PATENT,
        url="https://ipindia.gov.in/patent/1",
        publish_date="2026-08-20",
        trust_weight=0.90,
        is_change_signal=True,
        change_confidence=0.90,
        domain_tags=["energy", "materials", "manufacturing"]
    )

    gap_type, matches, score, rationale = analyzer.analyze_signal_gap(signal)
    assert len(matches) > 0
    top_match = matches[0]
    assert "002" in top_match.capability_id or "battery" in top_match.capability_name.lower() or "pouch" in top_match.capability_name.lower() or score > 0.3
    assert gap_type in [GapType.ADJACENT_ENHANCEMENT, GapType.CROSS_DOMAIN_CONVERGENCE]
