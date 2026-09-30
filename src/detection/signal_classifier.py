"""
Change Detection Signal Classifier
Distinguishes genuine strategic signals of change (new techniques, breakthrough metrics, regulations, funding inflections)
from routine industry noise and generic content aggregators.
"""

import re
import logging
from typing import List, Tuple, Dict, Any, Optional

from src.models import RawSignal, ProcessedSignal, SourceType, SOURCE_TRUST_WEIGHTS
from src.detection.embed import EmbeddingEngine

logger = logging.getLogger(__name__)


# Indicators of meaningful technical or market shifts
SIGNAL_INDICATORS = [
    r"\b(?:novel|new|breakthrough|demonstrate|achieve|synthesize|fabricate|report|formulation)\b",
    r"\b(?:efficiency|capacity|bandwidth|frequency|latency|conductivity|density|retention|resistance)\b",
    r"\b(?:patent|claim|method for|apparatus for|structure comprising)\b",
    r"\b(?:series [a-d]|seed round|raised \$|secured \$|financing led by|commercialize)\b",
    r"\b(?:mandate|directive|standard|rulemaking|compliance|regulation|quota|standardize)\b",
    r"\b(?:mhz|khz|ghz|mah/g|tops/w|pj/bit|s/cm|nm|µm|kohm|db)\b"
]

# Patterns characteristic of routine background noise
NOISE_INDICATORS = [
    r"\b(?:top 10|roundup|best of|gift guide|gadgets to watch|lifestyle|celebrity|horoscope)\b",
    r"\b(?:earnings call|webcast replay|quarterly financial review|conference call announcement)\b",
    r"\b(?:podcast episode|newsletter brainstorm|coffee consumption|bakery|sourdough)\b",
    r"\b(?:market forecast to reach \$|cagr|generic accessories|retail businesses)\b"
]


class SignalClassifier:
    def __init__(self, confidence_threshold: float = 0.50, embed_engine: Optional[EmbeddingEngine] = None):
        self.confidence_threshold = confidence_threshold
        self.embed_engine = embed_engine or EmbeddingEngine()

    def extract_key_entities(self, text: str) -> List[str]:
        """Extract technical metrics, chemical formulas, funding numbers, and standards."""
        entities = []
        # Quantitative metrics with units (e.g. 93.4%, 85 kHz, 45 TOPS/W, 680 mAh/g)
        metric_matches = re.findall(r"\b\d+(?:\.\d+)?\s*(?:kHz|MHz|GHz|TOPS/W|mAh/g|mS/cm|S/cm|µm|nm|pJ/bit|dB|kW|W/mm|V|%)\b", text, re.IGNORECASE)
        entities.extend(metric_matches[:4])

        # Funding figures ($24M, $50M)
        funding_matches = re.findall(r"\$\d+(?:\.\d+)?\s*(?:million|billion|M|B)\b", text, re.IGNORECASE)
        entities.extend(funding_matches[:2])

        # Standards and patent IDs (SAE J2954, US11983021, etc.)
        code_matches = re.findall(r"\b(?:US|EP|JP|WO|SAE|IEEE|ISO|NIST)[\s\-]?[A-Z0-9\/\.\-]+", text)
        entities.extend(code_matches[:3])

        return list(dict.fromkeys(entities))

    def classify_signal(self, signal: RawSignal) -> Tuple[bool, float, List[str]]:
        """
        Evaluate if a raw item is a genuine change signal.
        Returns (is_change_signal, confidence, extracted_entities).
        """
        full_text = f"{signal.title} {signal.raw_text}".lower()

        # Count signal positive vs noise negative triggers
        signal_score = 0.0
        for pattern in SIGNAL_INDICATORS:
            if re.search(pattern, full_text, re.IGNORECASE):
                signal_score += 0.20

        noise_penalty = 0.0
        for pattern in NOISE_INDICATORS:
            if re.search(pattern, full_text, re.IGNORECASE):
                noise_penalty += 0.35

        # Incorporate source provenance weight
        base_weight = signal.trust_weight

        # Entities boost confidence
        entities = self.extract_key_entities(f"{signal.title} {signal.raw_text}")
        if len(entities) > 0:
            signal_score += min(0.30, len(entities) * 0.10)

        # Baseline source types
        if signal.source_type in [SourceType.PEER_REVIEWED, SourceType.PATENT]:
            signal_score += 0.25
        elif signal.source_type == SourceType.POLICY:
            signal_score += 0.20

        # Calculate final confidence
        computed_confidence = min(1.0, max(0.0, (signal_score * 0.55 + base_weight * 0.45) - noise_penalty))

        is_signal = computed_confidence >= self.confidence_threshold and noise_penalty < 0.30

        return is_signal, round(computed_confidence, 3), entities

    def classify(self, text: str, source_type_str: str = "peer_reviewed") -> Tuple[bool, float, List[str], float]:
        """
        Convenience method to classify raw text.
        Returns (is_change_signal, confidence, extracted_entities, novelty_score).
        """
        source_type = SourceType(source_type_str) if source_type_str in [s.value for s in SourceType] else SourceType.PEER_REVIEWED
        trust_weight = SOURCE_TRUST_WEIGHTS.get(source_type.value, 0.75)
        raw = RawSignal(
            signal_id="temp_eval",
            title=text[:80],
            raw_text=text,
            source_name="Manual Evaluator",
            source_type=source_type,
            url="http://manual-eval",
            publish_date="2026-09-27",
            trust_weight=trust_weight
        )
        is_sig, conf, entities = self.classify_signal(raw)
        novelty = min(1.0, round(conf * 0.9 + (0.1 if len(entities) > 0 else 0.0), 2))
        return is_sig, conf, entities, novelty

    def process_and_embed_signals(self, raw_signals: List[RawSignal]) -> List[ProcessedSignal]:
        """Classify and compute embeddings for all incoming signals."""
        processed_list: List[ProcessedSignal] = []
        texts_to_embed = []
        pre_processed = []

        for raw in raw_signals:
            is_sig, conf, entities = self.classify_signal(raw)
            clean_text = f"{raw.title}. {raw.raw_text}"
            texts_to_embed.append(clean_text)
            pre_processed.append((raw, clean_text, is_sig, conf, entities))

        embeddings = self.embed_engine.embed_batch(texts_to_embed)

        for (raw, clean_text, is_sig, conf, entities), emb in zip(pre_processed, embeddings):
            processed_list.append(ProcessedSignal(
                signal_id=raw.signal_id,
                title=raw.title,
                clean_text=clean_text,
                source_name=raw.source_name,
                source_type=raw.source_type,
                url=raw.url,
                publish_date=raw.publish_date,
                domain_tags=raw.domain_tags,
                trust_weight=raw.trust_weight,
                is_change_signal=is_sig,
                change_confidence=conf,
                key_entities=entities,
                novelty_score=0.0,
                embedding=emb
            ))

        return processed_list


if __name__ == "__main__":
    classifier = SignalClassifier()
    s_good = RawSignal(
        signal_id="1",
        title="Low-loss sintered Ni-Zn-Cu ferrite sheets for 85 kHz wireless power transfer",
        raw_text="Achieved 42% loss reduction at 100 kHz with 410 mT saturation flux density.",
        source_name="arXiv",
        source_type=SourceType.PREPRINT,
        url="http://arxiv/1",
        publish_date="2026-08-01",
        trust_weight=0.75
    )
    s_bad = RawSignal(
        signal_id="2",
        title="Top 10 Gadgets to Watch at Tech Expo",
        raw_text="A roundup of lifestyle mugs and bluetooth headphones for consumers.",
        source_name="News",
        source_type=SourceType.NEWS,
        url="http://news/2",
        publish_date="2026-08-01",
        trust_weight=0.40
    )

    is_sig1, conf1, ent1 = classifier.classify_signal(s_good)
    is_sig2, conf2, ent2 = classifier.classify_signal(s_bad)

    print(f"Good item -> is_signal: {is_sig1}, conf: {conf1}, entities: {ent1}")
    print(f"Bad item  -> is_signal: {is_sig2}, conf: {conf2}, entities: {ent2}")
