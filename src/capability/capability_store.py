"""
Capability Knowledge Base & Vector Store
Encodes organizational technology capabilities into the unified embedding space and manages queries.
"""

import os
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np

from src.models import Capability, CapabilityMatch
from src.detection.embed import EmbeddingEngine
from src.storage.database import DatabaseManager

logger = logging.getLogger(__name__)


class CapabilityStore:
    def __init__(
        self,
        seed_path: str = "config/seed_capabilities.json",
        embed_engine: Optional[EmbeddingEngine] = None,
        db: Optional[DatabaseManager] = None
    ):
        self.seed_path = seed_path
        self.embed_engine = embed_engine or EmbeddingEngine()
        self.db = db or DatabaseManager()
        self.capabilities: List[Capability] = []
        self._load_and_sync()

    def _format_capability_text(self, cap: Capability) -> str:
        """Create structured representation for embedding."""
        metrics_str = ", ".join([f"{k}: {v}" for k, v in cap.key_technical_metrics.items()])
        domains_str = ", ".join(cap.domain)
        return (
            f"Capability: {cap.name}. "
            f"Domains: {domains_str}. "
            f"Description: {cap.description}. "
            f"Technical Specifications: {metrics_str}. "
            f"TRL: {cap.trl}."
        )

    def _load_and_sync(self):
        """Load capabilities from DB or seed file, compute embeddings if missing, and persist."""
        db_caps = self.db.get_capabilities()
        if db_caps:
            self.capabilities = db_caps
            logger.info(f"Loaded {len(self.capabilities)} capabilities from database.")
        elif os.path.exists(self.seed_path):
            self.seed_from_file(self.seed_path)
        else:
            logger.warning(f"No capabilities found in DB or at {self.seed_path}")

    def seed_from_file(self, file_path: str) -> int:
        """Load and vectorize capabilities from a JSON seed file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Seed file not found: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        new_caps: List[Capability] = []
        texts_to_embed = []

        for item in data:
            cap = Capability(
                capability_id=item["capability_id"],
                name=item["name"],
                domain=item.get("domain", []),
                description=item.get("description", ""),
                key_technical_metrics=item.get("key_technical_metrics", {}),
                trl=item.get("trl", 6),
                active_projects=item.get("active_projects", []),
                internal_patents=item.get("internal_patents", [])
            )
            new_caps.append(cap)
            texts_to_embed.append(self._format_capability_text(cap))

        embeddings = self.embed_engine.embed_batch(texts_to_embed)
        for cap, emb in zip(new_caps, embeddings):
            cap.embedding = emb

        self.capabilities = new_caps
        self.db.save_capabilities(self.capabilities)
        logger.info(f"Successfully seeded and embedded {len(self.capabilities)} capabilities from {file_path}.")
        return len(self.capabilities)

    def add_capability(self, capability: Capability) -> Capability:
        """Add or update a capability and generate its embedding."""
        text = self._format_capability_text(capability)
        capability.embedding = self.embed_engine.embed_text(text)

        # Replace if existing or append
        existing_idx = next((i for i, c in enumerate(self.capabilities) if c.capability_id == capability.capability_id), None)
        if existing_idx is not None:
            self.capabilities[existing_idx] = capability
        else:
            self.capabilities.append(capability)

        self.db.save_capabilities([capability])
        return capability

    def find_nearest_capabilities(self, query_embedding: List[float], top_k: int = 3) -> List[Tuple[Capability, float]]:
        """Find the top-K closest capabilities to a query vector using cosine similarity."""
        if not self.capabilities or not query_embedding:
            return []

        results = []
        for cap in self.capabilities:
            if cap.embedding is not None:
                sim = self.embed_engine.cosine_similarity(query_embedding, cap.embedding)
                results.append((cap, sim))

        results.sort(key=lambda x: x[1], reverse=True)
        return results[:top_k]

    def map_signal_to_capabilities(self, signal_embedding: List[float], threshold: float = 0.40) -> List[CapabilityMatch]:
        """Generate structured CapabilityMatch objects for a given signal embedding."""
        nearest = self.find_nearest_capabilities(signal_embedding, top_k=4)
        matches = []
        for cap, sim in nearest:
            if sim >= threshold:
                matches.append(CapabilityMatch(
                    capability_id=cap.capability_id,
                    capability_name=cap.name,
                    similarity_score=round(sim, 4),
                    adjacency_rationale=f"Shared domain {', '.join(cap.domain[:2])} with cosine similarity {sim:.2f}"
                ))
        return matches

    def get_all(self) -> List[Capability]:
        return self.capabilities

    def get_by_id(self, capability_id: str) -> Optional[Capability]:
        for c in self.capabilities:
            if c.capability_id == capability_id:
                return c
        return None


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Seed or inspect capabilities")
    parser.add_argument("--seed", type=str, default="config/seed_capabilities.json", help="Path to seed JSON file")
    args = parser.parse_args()

    store = CapabilityStore(seed_path=args.seed)
    print(f"Loaded {len(store.get_all())} capabilities:")
    for c in store.get_all()[:5]:
        print(f" - [{c.capability_id}] {c.name} (TRL {c.trl})")
