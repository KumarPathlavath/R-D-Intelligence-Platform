import pytest
from src.models import RawSignal, SourceType
from src.detection.dedupe import SignalDeduplicator, normalize_title, compute_title_jaccard


def test_title_normalization():
    t1 = "Low-loss sintered Ni-Zn-Cu ferrite sheets for 85 kHz WPT coils!"
    t2 = "low loss sintered ni zn cu ferrite sheets for 85 khz wpt coils"
    assert normalize_title(t1) == normalize_title(t2)


def test_jaccard_similarity():
    t1 = "Resonant wireless power transfer for electric vehicles"
    t2 = "Resonant wireless power transfer for electric vehicles."
    assert compute_title_jaccard(t1, t2) == 1.0


def test_deduplicator_exact_and_fuzzy():
    deduper = SignalDeduplicator(jaccard_threshold=0.80)

    s1 = RawSignal(
        signal_id="sig_1",
        title="High efficiency silicon anode battery chemistry",
        raw_text="Text 1",
        source_name="arXiv",
        source_type=SourceType.PREPRINT,
        url="http://arxiv.org/1",
        publish_date="2026-08-01",
        trust_weight=0.75
    )

    s2 = RawSignal(
        signal_id="sig_2",
        title="High efficiency silicon anode battery chemistry",
        raw_text="Exact duplicate from another feed",
        source_name="arXiv",
        source_type=SourceType.PREPRINT,
        url="http://arxiv.org/1",
        publish_date="2026-08-01",
        trust_weight=0.75
    )

    s3 = RawSignal(
        signal_id="sig_3",
        title="High efficiency silicon anode battery chemistry with polymer binders",
        raw_text="Slightly modified title",
        source_name="USPTO",
        source_type=SourceType.PATENT,
        url="http://patent/1",
        publish_date="2026-08-02",
        trust_weight=0.90
    )

    s4 = RawSignal(
        signal_id="sig_4",
        title="Quantum diamond magnetometry for defect screening",
        raw_text="Completely different topic",
        source_name="Nature",
        source_type=SourceType.PEER_REVIEWED,
        url="http://nature/1",
        publish_date="2026-08-05",
        trust_weight=1.00
    )

    unique, dup_count = deduper.deduplicate([s1, s2, s3, s4])
    assert len(unique) >= 2
    assert dup_count >= 1
