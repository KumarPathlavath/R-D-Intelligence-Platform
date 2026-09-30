"""
Signal Deduplication Module
Performs exact hash matching and fuzzy/semantic similarity deduplication across incoming signals.
"""

import re
import hashlib
from typing import List, Tuple, Set, Dict, Any
from src.models import RawSignal


def normalize_title(title: str) -> str:
    """Normalize title for exact and fuzzy matching."""
    text = title.lower()
    # Replace punctuation with whitespace
    text = re.sub(r"[^\w\s]", " ", text)
    # Collapse multiple whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text


def compute_title_jaccard(title1: str, title2: str) -> float:
    """Compute token-level Jaccard similarity between two titles."""
    tokens1 = set(normalize_title(title1).split())
    tokens2 = set(normalize_title(title2).split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union)


class SignalDeduplicator:
    def __init__(self, jaccard_threshold: float = 0.82):
        self.jaccard_threshold = jaccard_threshold

    def deduplicate(self, raw_signals: List[RawSignal]) -> Tuple[List[RawSignal], int]:
        """
        Deduplicates a list of raw signals.
        Returns (unique_signals, duplicate_count).
        """
        seen_exact_hashes: Set[str] = set()
        unique_signals: List[RawSignal] = []
        duplicate_count = 0

        for signal in raw_signals:
            # 1. Exact hash test
            exact_key = f"{signal.source_type.value}::{normalize_title(signal.title)}"
            exact_hash = hashlib.sha256(exact_key.encode("utf-8")).hexdigest()

            if exact_hash in seen_exact_hashes:
                duplicate_count += 1
                continue

            # 2. Fuzzy match against already accepted items
            is_fuzzy_duplicate = False
            for existing in unique_signals:
                jaccard = compute_title_jaccard(signal.title, existing.title)
                if jaccard >= self.jaccard_threshold:
                    # Higher trust weight source takes precedence, or retain both in metadata
                    is_fuzzy_duplicate = True
                    duplicate_count += 1
                    # Merge metadata
                    existing.raw_metadata[f"duplicate_ref_{signal.source_name}"] = signal.url
                    if signal.trust_weight > existing.trust_weight:
                        existing.trust_weight = signal.trust_weight
                    break

            if not is_fuzzy_duplicate:
                seen_exact_hashes.add(exact_hash)
                unique_signals.append(signal)

        return unique_signals, duplicate_count


if __name__ == "__main__":
    from src.models import SourceType
    s1 = RawSignal(
        signal_id="1",
        title="Low-loss sintered Ni-Zn-Cu ferrite sheets for 85 kHz inductive couplers",
        raw_text="Paper 1",
        source_name="arXiv",
        source_type=SourceType.PREPRINT,
        url="http://arxiv/1",
        publish_date="2026-08-01",
        trust_weight=0.75
    )
    s2 = RawSignal(
        signal_id="2",
        title="Low-loss sintered Ni-Zn-Cu ferrite sheets for 85 kHz inductive couplers.",
        raw_text="Paper 2 duplicate",
        source_name="SemanticScholar",
        source_type=SourceType.PEER_REVIEWED,
        url="http://semantic/1",
        publish_date="2026-08-01",
        trust_weight=1.00
    )
    deduper = SignalDeduplicator()
    uniques, dupes = deduper.deduplicate([s1, s2])
    print(f"Total: 2, Unique: {len(uniques)}, Duplicates: {dupes}, Retained Weight: {uniques[0].trust_weight}")
