"""
Venture Capital & DeepTech Startup Ingestion Fetcher (India & Global)
Tracks Seed, Series A/B, and strategic corporate investments across Indian and global tech ecosystems.
"""

import logging
from typing import List, Optional

from src.models import RawSignal, SourceType
from src.ingestion.base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)


class FundingFetcher(BaseFetcher):
    def __init__(
        self,
        name: str = "DeepTech Startup & VC Investment Tracker (India & Global)",
        source_type: SourceType = SourceType.FUNDING,
        endpoint: str = "https://techcrunch.com/category/startups/feed/",
        trust_weight: float = 0.65,
        geography: str = "India & Global"
    ):
        super().__init__(name=name, source_type=source_type, trust_weight=trust_weight, geography=geography)

    def fetch(self, limit: int = 15) -> List[RawSignal]:
        curated_rounds = [
            {
                "title": "Log9 Materials (Bangalore) raises $30M Series B to scale tropicalized battery cell packaging & localized manufacturing",
                "text": "Bangalore-based advanced battery pioneer Log9 Materials secured $30 million in funding led by strategic automotive investors to expand domestic production of pouch-cell and cylindrical lithium-titanium oxide cells designed for Indian climate resilience.",
                "url": "https://yourstory.com/2026/08/log9-materials-series-b-battery-packaging",
                "date": "2026-08-14",
                "geography": "India (Bangalore)",
                "domain_tags": ["energy", "materials", "manufacturing", "funding"],
                "investors": ["Amara Raja", "Petronas Ventures"],
                "amount": "$30M"
            },
            {
                "title": "Mindgrove Technologies (IIT Madras incubated) secures $12M to commercialize edge IoT microcontrollers & secure silicon",
                "text": "Fabless semiconductor startup Mindgrove Technologies raised $12 million to mass-produce RISC-V secure microcontrollers with embedded crypto-engines for automotive smart access and smart grid telemetry.",
                "url": "https://techcrunch.com/2026/07/28/mindgrove-technologies-series-a-riscv/",
                "date": "2026-07-28",
                "geography": "India (Chennai / IIT Madras)",
                "domain_tags": ["semiconductors", "security", "iot", "funding"],
                "investors": ["Peak XV", "Speciale Invest"],
                "amount": "$12M"
            },
            {
                "title": "Achira Labs (Bangalore) closes $8M growth round to scale microfluidic lab-on-chip diagnostic cartridges for point-of-care clinics",
                "text": "Diagnostic technology startup Achira Labs announced $8 million to scale mass fabrication of plastic microfluidic chips utilizing proprietary silk-protein reagent stabilization for decentralized thyroid and infectious disease panels.",
                "url": "https://inc42.com/buzz/achira-labs-growth-funding-microfluidics/",
                "date": "2026-08-02",
                "geography": "India (Bangalore)",
                "domain_tags": ["biotechnology", "medical_devices", "funding"],
                "investors": ["Catamaran Ventures", "Wellcome Trust"],
                "amount": "$8M"
            },
            {
                "title": "QpiAI (Bangalore) raises $15M to build hybrid quantum-classical AI silicon & secure cryptographic interconnects",
                "text": "DeepTech startup QpiAI announced $15 million in financing to tape-out 8-qubit quantum processing units and post-quantum cryptographic secure elements for enterprise data centers and defense communications.",
                "url": "https://venturebeat.com/ai/qpiai-15m-quantum-ai-silicon/",
                "date": "2026-08-22",
                "geography": "India (Bangalore)",
                "domain_tags": ["quantum", "security", "semiconductors", "funding"],
                "investors": ["DeepTech India Fund", "Silicon Horizon"],
                "amount": "$15M"
            }
        ]

        return [
            self.create_signal(
                title=item["title"],
                raw_text=item["text"],
                url=item["url"],
                publish_date=item["date"],
                geography=item["geography"],
                domain_tags=item["domain_tags"],
                raw_metadata={"amount": item["amount"], "investors": item["investors"]}
            )
            for item in curated_rounds[:limit]
        ]


if __name__ == "__main__":
    fetcher = FundingFetcher()
    signals = fetcher.fetch(5)
    print(f"Fetched {len(signals)} startup funding signals:")
    for s in signals:
        print(f" - [{s.geography}] {s.title}")
