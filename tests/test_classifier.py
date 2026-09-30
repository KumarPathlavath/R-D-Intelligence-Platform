import pytest
from src.models import RawSignal, SourceType
from src.detection.signal_classifier import SignalClassifier


def test_classifier_signal_vs_noise():
    classifier = SignalClassifier(confidence_threshold=0.50)

    good_raw = RawSignal(
        signal_id="sig_breakthrough",
        title="Optoelectronic matrix multiplier with 45 TOPS/W efficiency",
        raw_text="We report an integrated photonic crossbar using phase-change materials achieving 45 TOPS/W and sub-nanosecond latency.",
        source_name="IEEE",
        source_type=SourceType.PEER_REVIEWED,
        url="http://ieee/1",
        publish_date="2026-08-10",
        trust_weight=1.00
    )

    bad_raw = RawSignal(
        signal_id="sig_noise",
        title="Top 10 Gadgets to Watch at Tech Expo",
        raw_text="Here is our annual roundup of consumer electronics, coffee mugs, and lifestyle gadgets.",
        source_name="Blog",
        source_type=SourceType.NEWS,
        url="http://blog/1",
        publish_date="2026-08-10",
        trust_weight=0.40
    )

    is_sig_good, conf_good, entities_good = classifier.classify_signal(good_raw)
    is_sig_bad, conf_bad, entities_bad = classifier.classify_signal(bad_raw)

    assert is_sig_good is True
    assert conf_good > conf_bad
    assert is_sig_bad is False
    assert any("TOPS/W" in e for e in entities_good)
