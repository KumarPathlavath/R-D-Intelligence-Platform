"""
Gap Identification & Similarity Engine
Computes similarity between external signals and internal capabilities to flag strategic technology gaps.
"""

import logging
from typing import List, Dict, Any, Tuple, Optional
import numpy as np

from src.models import ProcessedSignal, Capability, GapType, CapabilityMatch
from src.capability.capability_store import CapabilityStore
from src.detection.embed import EmbeddingEngine

logger = logging.getLogger(__name__)


class GapAnalyzer:
    def __init__(
        self,
        capability_store: Optional[CapabilityStore] = None,
        embed_engine: Optional[EmbeddingEngine] = None,
        adjacent_threshold: float = 0.52,
        convergence_threshold: float = 0.38,
        upper_saturation_bound: float = 0.94
    ):
        self.embed_engine = embed_engine or EmbeddingEngine()
        self.capability_store = capability_store or CapabilityStore(embed_engine=self.embed_engine)
        self.adjacent_threshold = adjacent_threshold
        self.convergence_threshold = convergence_threshold
        self.upper_saturation_bound = upper_saturation_bound

    def analyze_signal_gap(
        self, signal: ProcessedSignal
    ) -> Tuple[GapType, List[CapabilityMatch], float, str]:
        """
        Analyze a processed signal against all organizational capabilities.
        Returns: (gap_type, capability_matches, gap_relevance_score, technical_rationale)
        """
        if signal.embedding is None:
            signal.embedding = self.embed_engine.embed_text(signal.clean_text)

        caps = self.capability_store.get_all()
        if not caps:
            return (
                GapType.WHITE_SPACE_FRONTIER,
                [],
                0.5,
                "No internal capabilities registered in knowledge base."
            )

        # Compute similarities against all internal capabilities
        cap_similarities: List[Tuple[Capability, float]] = []
        for cap in caps:
            if cap.embedding is not None:
                sim = self.embed_engine.cosine_similarity(signal.embedding, cap.embedding)
                cap_similarities.append((cap, sim))

        cap_similarities.sort(key=lambda x: x[1], reverse=True)

        top_cap, max_sim = cap_similarities[0]

        # Build capability match list for items meeting convergence threshold
        matches: List[CapabilityMatch] = []
        for cap, sim in cap_similarities[:3]:
            if sim >= self.convergence_threshold:
                matches.append(CapabilityMatch(
                    capability_id=cap.capability_id,
                    capability_name=cap.name,
                    similarity_score=round(sim, 4),
                    adjacency_rationale=f"Domain overlap in {', '.join(cap.domain[:2])} (Cosine: {sim:.2f})"
                ))

        # Classify Gap Type
        if max_sim >= self.adjacent_threshold:
            gap_type = GapType.ADJACENT_ENHANCEMENT
            rationale = (
                f"Directly adjacent to internal capability [{top_cap.capability_id}: {top_cap.name}] "
                f"(similarity {max_sim:.2f}). Represents an uncovered formulation, metric, or technique."
            )
            relevance = max_sim * 0.90 + signal.trust_weight * 0.10

        elif max_sim >= self.convergence_threshold:
            gap_type = GapType.CROSS_DOMAIN_CONVERGENCE
            rationale = (
                f"Cross-domain convergence between external development and [{top_cap.capability_id}: {top_cap.name}] "
                f"(similarity {max_sim:.2f})."
            )
            relevance = max_sim * 0.85 + signal.trust_weight * 0.15

        else:
            gap_type = GapType.WHITE_SPACE_FRONTIER
            rationale = (
                f"External technological breakthrough with low overlap (max similarity {max_sim:.2f}) "
                f"to internal capabilities. Represents potential white-space frontier."
            )
            relevance = (1.0 - max_sim) * 0.60 + signal.trust_weight * 0.40

        return gap_type, matches, round(float(relevance), 3), rationale

    def identify_gaps_for_batch(
        self, signals: List[ProcessedSignal]
    ) -> List[Dict[str, Any]]:
        """Run gap analysis over a batch of change signals."""
        results = []
        for s in signals:
            if not s.is_change_signal:
                continue
            gap_type, matches, relevance, rationale = self.analyze_signal_gap(s)
            results.append({
                "signal": s,
                "gap_type": gap_type,
                "capability_matches": matches,
                "relevance_score": relevance,
                "rationale": rationale
            })
        return results


if __name__ == "__main__":
    analyzer = GapAnalyzer()
    from src.models import SourceType
    test_sig = ProcessedSignal(
        signal_id="sig_test",
        title="Low-loss sintered Ni-Zn-Cu ferrite composite sheets for 85 kHz WPT coils",
        clean_text="Low-loss sintered Ni-Zn-Cu ferrite composite sheets for 85 kHz to 150 kHz high-power inductive couplers.",
        source_name="arXiv",
        source_type=SourceType.PREPRINT,
        url="https://arxiv.org/abs/2608.10928",
        publish_date="2026-08-20",
        trust_weight=0.75,
        is_change_signal=True,
        change_confidence=0.88,
        key_entities=["85 kHz", "Ni-Zn-Cu ferrite"],
        novelty_score=0.45
    )
    gap_type, matches, rel, rat = analyzer.analyze_signal_gap(test_sig)
    print(f"Gap Type: {gap_type.value}")
    print(f"Relevance: {rel}")
    print(f"Rationale: {rat}")
    for m in matches:
        print(f" - Matched Cap: {m.capability_id} ({m.capability_name}) -> {m.similarity_score}")
