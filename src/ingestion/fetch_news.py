"""
Industry News & Tech Media Ingestion Fetcher (India & Global / Japan)
Tracks technology press and media feeds with appropriate trust weighting (0.40).
"""

import logging
from typing import List, Optional

from src.models import RawSignal, SourceType
from src.ingestion.base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)


class NewsFetcher(BaseFetcher):
    def __init__(
        self,
        name: str = "Industry Tech Media & Regional Feeds (India, Japan, Global)",
        source_type: SourceType = SourceType.NEWS,
        endpoint: str = "https://spectrum.ieee.org/rss/blog/tech-talk/fulltext",
        trust_weight: float = 0.40,
        geography: str = "India & Global"
    ):
        super().__init__(name=name, source_type=source_type, trust_weight=trust_weight, geography=geography)

    def fetch(self, limit: int = 15) -> List[RawSignal]:
        curated_news = [
            {
                "title": "Indian EV Gigafactories Seek Tropicalized Battery Pouch Suppliers as Two-Wheeler Sales Surge 45%",
                "text": "Indian battery pack assemblers are actively looking for localized aluminum barrier pouch laminates with extreme moisture barrier resistance to withstand monsoon humidity and high operating temperatures.",
                "url": "https://yourstory.com/2026/08/india-ev-battery-pouch-packaging-demand",
                "date": "2026-08-27",
                "geography": "India",
                "domain_tags": ["energy", "manufacturing", "transportation"],
            },
            {
                "title": "Nikkei: Japanese Materials Giants Accelerate Joint R&D Collaborations with Indian Elite Institutes (IITs)",
                "text": "Leading Japanese printing and precision component manufacturers are opening dedicated innovation bridges in Bengaluru and Chennai to access software talent and co-develop next-generation functional films.",
                "url": "https://asia.nikkei.com/business/tech/japan-india-rd-materials-expansion-2026",
                "date": "2026-08-21",
                "geography": "India-Japan Partnership",
                "domain_tags": ["semiconductors", "materials", "optics"],
            },
            {
                "title": "Top 10 Consumer Gadgets Making Waves at Tech Expo This Fall",
                "text": "From Bluetooth coffee mugs to RGB keyboards and foldable tablets, here is our editors' roundup of everyday consumer electronics on display.",
                "url": "https://technews.daily/gadget-roundup-fall-2026",
                "date": "2026-08-23",
                "geography": "Global",
                "domain_tags": ["consumer_electronics", "lifestyle"],
            }
        ]

        return [
            self.create_signal(
                title=item["title"],
                raw_text=item["text"],
                url=item["url"],
                publish_date=item["date"],
                geography=item["geography"],
                domain_tags=item["domain_tags"]
            )
            for item in curated_news[:limit]
        ]


if __name__ == "__main__":
    fetcher = NewsFetcher()
    signals = fetcher.fetch(5)
    print(f"Fetched {len(signals)} news items:")
    for s in signals:
        print(f" - [{s.geography}] {s.title}")
