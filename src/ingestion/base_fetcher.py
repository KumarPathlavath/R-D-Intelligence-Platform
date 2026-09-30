"""
Base Fetcher Interface for External Source Ingestion (India & Global)
Provides resilient HTTP querying, rate limiting, error catching, and source provenance weighting.
"""

import abc
import hashlib
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from src.models import RawSignal, SourceType, SOURCE_TRUST_WEIGHTS

logger = logging.getLogger(__name__)


class BaseFetcher(abc.ABC):
    def __init__(self, name: str, source_type: SourceType, trust_weight: Optional[float] = None, geography: str = "Global"):
        self.name = name
        self.source_type = source_type
        self.geography = geography
        self.trust_weight = trust_weight if trust_weight is not None else SOURCE_TRUST_WEIGHTS.get(source_type.value, 0.5)

    def generate_signal_id(self, title: str, source_name: str) -> str:
        """Deterministic unique ID based on title and source hash."""
        clean_key = f"{source_name.strip().lower()}::{title.strip().lower()}"
        return f"sig_{hashlib.sha256(clean_key.encode('utf-8')).hexdigest()[:12]}"

    @abc.abstractmethod
    def fetch(self, limit: int = 20) -> List[RawSignal]:
        """Fetch items from the external source."""
        pass

    def create_signal(
        self,
        title: str,
        raw_text: str,
        url: str,
        publish_date: str,
        geography: Optional[str] = None,
        domain_tags: Optional[List[str]] = None,
        raw_metadata: Optional[Dict[str, Any]] = None
    ) -> RawSignal:
        signal_id = self.generate_signal_id(title, self.name)
        return RawSignal(
            signal_id=signal_id,
            title=title.strip(),
            raw_text=raw_text.strip(),
            source_name=self.name,
            source_type=self.source_type,
            url=url.strip(),
            publish_date=publish_date or datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            geography=geography or self.geography,
            domain_tags=domain_tags or [],
            trust_weight=self.trust_weight,
            raw_metadata=raw_metadata or {},
            ingested_at=datetime.now(timezone.utc).isoformat()
        )
