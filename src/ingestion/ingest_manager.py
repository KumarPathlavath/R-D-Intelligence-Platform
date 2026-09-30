"""
Unified Ingestion Manager
Coordinates multi-source ingestion pipelines across papers, patents, funding, policy, and news.
"""

import os
import yaml
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from src.models import RawSignal, SourceType, SOURCE_TRUST_WEIGHTS
from src.storage.database import DatabaseManager
from src.ingestion.fetch_papers import PaperFetcher
from src.ingestion.fetch_patents import PatentFetcher
from src.ingestion.fetch_funding import FundingFetcher
from src.ingestion.fetch_policy import PolicyFetcher
from src.ingestion.fetch_news import NewsFetcher

logger = logging.getLogger(__name__)


class IngestionManager:
    def __init__(self, config_path: str = "config/sources.yaml", db: Optional[DatabaseManager] = None):
        self.config_path = config_path
        self.db = db or DatabaseManager()
        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    return yaml.safe_load(f) or {}
            except Exception as e:
                logger.error(f"Error loading {self.config_path}: {e}")
        return {}

    def run_ingestion_cycle(self, limit_per_source: int = 10) -> Dict[str, Any]:
        """Execute a full ingestion cycle across all enabled source categories."""
        all_signals: List[RawSignal] = []
        source_counts: Dict[str, int] = {}

        fetchers = [
            PaperFetcher(name="arXiv & Semantic Scholar", trust_weight=0.75),
            PatentFetcher(name="USPTO & Patent Databases", trust_weight=0.90),
            FundingFetcher(name="DeepTech Venture & Capital Tracker", trust_weight=0.65),
            PolicyFetcher(name="Government & Standards Bulletins", trust_weight=0.85),
            NewsFetcher(name="Industry Tech Media & RSS", trust_weight=0.40),
        ]

        for fetcher in fetchers:
            try:
                signals = fetcher.fetch(limit=limit_per_source)
                all_signals.extend(signals)
                source_counts[fetcher.source_type.value] = len(signals)
            except Exception as e:
                logger.error(f"Failed to fetch from {fetcher.name}: {e}")
                source_counts[fetcher.source_type.value] = 0

        saved_count = self.db.save_raw_signals(all_signals)

        return {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "total_fetched": len(all_signals),
            "saved_to_db": saved_count,
            "source_breakdown": source_counts
        }


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    manager = IngestionManager()
    summary = manager.run_ingestion_cycle(limit_per_source=5)
    print("Ingestion Cycle Complete:", summary)
