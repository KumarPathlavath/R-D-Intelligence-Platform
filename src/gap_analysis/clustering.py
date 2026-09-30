"""
Time-Windowed Signal Clustering & Trend Detection
Clusters multi-source signals over time using embedding similarity, temporal decay, and HDBSCAN / Agglomerative clustering.
"""

import math
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.cluster import HDBSCAN, AgglomerativeClustering

from src.models import ProcessedSignal, SignalCluster
from src.detection.embed import EmbeddingEngine

logger = logging.getLogger(__name__)


class TemporalSignalClusterer:
    def __init__(
        self,
        embed_engine: Optional[EmbeddingEngine] = None,
        half_life_days: float = 90.0,
        cluster_distance_threshold: float = 0.55,
        min_cluster_size: int = 2
    ):
        self.embed_engine = embed_engine or EmbeddingEngine()
        self.half_life_days = half_life_days
        self.cluster_distance_threshold = cluster_distance_threshold
        self.min_cluster_size = min_cluster_size

    def _parse_date(self, date_str: str) -> datetime:
        for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%Y-%m-%dT%H:%M:%S", "%a, %d %b %Y %H:%M:%S %z"):
            try:
                return datetime.strptime(date_str[:10], "%Y-%m-%d")
            except Exception:
                pass
        return datetime.now(timezone.utc)

    def _compute_spatiotemporal_distance_matrix(self, signals: List[ProcessedSignal]) -> np.ndarray:
        n = len(signals)
        embeddings = np.array([s.embedding for s in signals], dtype=np.float32)
        
        # 1. Cosine distance (1.0 - similarity)
        cosine_sim = self.embed_engine.cosine_similarity_matrix(embeddings, embeddings)
        cosine_dist = np.clip(1.0 - cosine_sim, 0.0, 2.0)

        # 2. Temporal distance penalty
        dates = [self._parse_date(s.publish_date) for s in signals]
        temp_matrix = np.zeros((n, n), dtype=np.float32)

        for i in range(n):
            for j in range(i, n):
                day_diff = abs((dates[i] - dates[j]).days)
                # Exponential decay penalty
                time_penalty = 1.0 - math.exp(-day_diff / self.half_life_days)
                combined = 0.70 * cosine_dist[i, j] + 0.30 * time_penalty
                temp_matrix[i, j] = combined
                temp_matrix[j, i] = combined

        return temp_matrix

    def _calculate_source_diversity(self, source_distribution: Dict[str, int]) -> float:
        """Calculate normalized Shannon entropy across source types (0.0 to 1.0)."""
        total = sum(source_distribution.values())
        if total <= 1:
            return 0.0
        num_categories = 6  # 6 source types
        entropy = 0.0
        for count in source_distribution.values():
            if count > 0:
                p = count / total
                entropy -= p * math.log2(p)
        max_entropy = math.log2(num_categories)
        return min(1.0, entropy / max_entropy)

    def cluster_signals(self, signals: List[ProcessedSignal]) -> List[SignalCluster]:
        """Group change signals into emerging multi-signal clusters."""
        if not signals:
            return []

        # Ensure embeddings are present
        for s in signals:
            if s.embedding is None:
                s.embedding = self.embed_engine.embed_text(s.clean_text)

        if len(signals) < self.min_cluster_size:
            # Return single clusters
            clusters = []
            for i, s in enumerate(signals):
                clusters.append(SignalCluster(
                    cluster_id=f"clust_{i+1:03d}",
                    cluster_label=s.title[:60],
                    domain=s.domain_tags[0] if s.domain_tags else "emerging",
                    signal_ids=[s.signal_id],
                    signals=[s],
                    source_type_distribution={s.source_type.value: 1},
                    earliest_date=s.publish_date,
                    latest_date=s.publish_date,
                    time_span_days=0,
                    cross_source_diversity=0.0
                ))
            return clusters

        dist_matrix = self._compute_spatiotemporal_distance_matrix(signals)

        # Cluster using Agglomerative with precomputed distance
        try:
            clustering = AgglomerativeClustering(
                n_clusters=None,
                distance_threshold=self.cluster_distance_threshold,
                metric="precomputed",
                linkage="average"
            )
            labels = clustering.fit_predict(dist_matrix)
        except Exception as e:
            logger.warning(f"Clustering error: {e}. Grouping individually.")
            labels = list(range(len(signals)))

        # Group signals by label
        cluster_groups: Dict[int, List[ProcessedSignal]] = {}
        for idx, label in enumerate(labels):
            cluster_groups.setdefault(label, []).append(signals[idx])

        result_clusters: List[SignalCluster] = []
        for cluster_num, (label, group) in enumerate(cluster_groups.items(), start=1):
            source_dist: Dict[str, int] = {}
            for s in group:
                source_dist[s.source_type.value] = source_dist.get(s.source_type.value, 0) + 1

            parsed_dates = [self._parse_date(s.publish_date) for s in group]
            min_date = min(parsed_dates).strftime("%Y-%m-%d")
            max_date = max(parsed_dates).strftime("%Y-%m-%d")
            time_span = (max(parsed_dates) - min_date_parsed if (min_date_parsed := min(parsed_dates)) else 0).days

            # Domain selection by majority
            all_domains = [d for s in group for d in s.domain_tags]
            main_domain = max(set(all_domains), key=all_domains.count) if all_domains else "technology"

            # Derive representative label from highest-weight signal
            top_signal = max(group, key=lambda s: s.trust_weight)
            cluster_label = top_signal.title

            diversity = self._calculate_source_diversity(source_dist)

            result_clusters.append(SignalCluster(
                cluster_id=f"clust_{cluster_num:03d}",
                cluster_label=cluster_label,
                domain=main_domain,
                signal_ids=[s.signal_id for s in group],
                signals=group,
                source_type_distribution=source_dist,
                earliest_date=min_date,
                latest_date=max_date,
                time_span_days=time_span,
                cross_source_diversity=round(diversity, 3)
            ))

        # Sort clusters by number of signals and diversity
        result_clusters.sort(key=lambda c: (len(c.signals), c.cross_source_diversity), reverse=True)
        return result_clusters


if __name__ == "__main__":
    from src.models import SourceType
    clusterer = TemporalSignalClusterer()
    s1 = ProcessedSignal(
        signal_id="1",
        title="Low-loss sintered Ni-Zn-Cu ferrite composite sheets for 85 kHz WPT coils",
        clean_text="Low-loss sintered Ni-Zn-Cu ferrite composite sheets for 85 kHz to 150 kHz high-power inductive couplers.",
        source_name="arXiv",
        source_type=SourceType.PREPRINT,
        url="https://arxiv.org/abs/2608.10928",
        publish_date="2026-08-20",
        trust_weight=0.75,
        is_change_signal=True,
        change_confidence=0.88,
        domain_tags=["energy", "materials"]
    )
    s2 = ProcessedSignal(
        signal_id="2",
        title="Interleaved magnetic shielding geometry for high-frequency wireless power transfer pads",
        clean_text="An electromagnetic shielding arrangement for resonant wireless power transfer.",
        source_name="USPTO",
        source_type=SourceType.PATENT,
        url="https://patents.google.com/patent/EP4192847A1",
        publish_date="2026-08-11",
        trust_weight=0.90,
        is_change_signal=True,
        change_confidence=0.92,
        domain_tags=["energy", "electronics"]
    )
    clusters = clusterer.cluster_signals([s1, s2])
    print(f"Generated {len(clusters)} clusters:")
    for c in clusters:
        print(f" - [{c.cluster_id}] {c.cluster_label} (Signals: {len(c.signals)}, Diversity: {c.cross_source_diversity})")
