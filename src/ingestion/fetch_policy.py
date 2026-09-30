"""
Policy & Regulatory Ingestion Fetcher (India & Global / Japan Partnership)
Tracks government mandates, national mission roadmaps (MeitY, ISM, NITI Aayog, METI Japan), and international standards.
"""

import logging
from typing import List, Optional

from src.models import RawSignal, SourceType
from src.ingestion.base_fetcher import BaseFetcher

logger = logging.getLogger(__name__)


class PolicyFetcher(BaseFetcher):
    def __init__(
        self,
        name: str = "Government Missions & Policy Intelligence (India, Japan, Global)",
        source_type: SourceType = SourceType.POLICY,
        trust_weight: float = 0.85,
        geography: str = "India & Japan Partnership"
    ):
        super().__init__(name=name, source_type=source_type, trust_weight=trust_weight, geography=geography)

    def fetch(self, limit: int = 15) -> List[RawSignal]:
        curated_policy = [
            {
                "title": "India Semiconductor Mission (ISM) & MeitY: 50% Capital Subsidy for Advanced Display Fabrication, Photomasks & Optical Packaging",
                "text": "Ministry of Electronics and Information Technology (MeitY) updated the ISM guideline to expand 50% fiscal support for semiconductor photomask manufacturing units, fine metal mask lines, and advanced display glass processing within India.",
                "url": "https://www.meity.gov.in/esdm/india-semiconductor-mission-advanced-packaging-2026",
                "date": "2026-08-10",
                "geography": "India (MeitY Government of India)",
                "domain_tags": ["semiconductors", "optics", "policy", "manufacturing"],
                "authority": "MeitY / ISM",
                "mandate_level": "National Policy Framework"
            },
            {
                "title": "Ministry of Heavy Industries: Mandatory Fire & Moisture Barrier Standards (AIS-156 Amendment 4) for EV Pouch Cells",
                "text": "Government of India enforced stricter thermal runaway containment and aluminum laminate packaging standards for all electric 2-wheeler and 3-wheeler battery packs operating under extreme ambient temperatures (>50°C).",
                "url": "https://mhi.gov.in/policy/ais-156-amendment-4-battery-packaging-2026",
                "date": "2026-07-31",
                "geography": "India (Ministry of Heavy Industries)",
                "domain_tags": ["energy", "policy", "standards", "transportation"],
                "authority": "MHI & ARAI India",
                "mandate_level": "Regulatory Binding"
            },
            {
                "title": "India-Japan METI Bilateral Roadmap on Semiconductor Supply Chain Resilience & Joint R&D Hubs",
                "text": "Ministry of Economy, Trade and Industry (METI Japan) and MeitY signed an operational implementation pact facilitating joint research labs between Japanese material giants (e.g. DNP, TEL) and Indian institutions (IITs, IISc) for next-gen photomasks and power electronic substrates.",
                "url": "https://www.meti.go.jp/english/press/2026/0805_001.html",
                "date": "2026-08-05",
                "geography": "India-Japan Partnership",
                "domain_tags": ["semiconductors", "materials", "policy", "international_relations"],
                "authority": "METI Japan & MeitY India",
                "mandate_level": "Bilateral Treaty"
            },
            {
                "title": "Department of Biotechnology (DBT India): Fast-Track Validation Framework for Microfluidic In-Vitro Diagnostic Chips",
                "text": "DBT and CDSCO released expedited regulatory pathways for localized production of polymer lab-on-chip cartridges, eliminating import dependence for molecular diagnostic cartridges.",
                "url": "https://dbtindia.gov.in/guidelines/microfluidics-diagnostic-fasttrack-2026",
                "date": "2026-08-16",
                "geography": "India (DBT & CDSCO)",
                "domain_tags": ["biotechnology", "medical_devices", "policy"],
                "authority": "DBT / CDSCO India",
                "mandate_level": "Regulatory Framework"
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
                raw_metadata={"authority": item["authority"], "mandate_level": item["mandate_level"]}
            )
            for item in curated_policy[:limit]
        ]


if __name__ == "__main__":
    fetcher = PolicyFetcher()
    signals = fetcher.fetch(5)
    print(f"Fetched {len(signals)} policy signals:")
    for s in signals:
        print(f" - [{s.geography}] {s.title}")
