"""
End-to-End Pipeline Orchestrator
Coordinates Ingestion -> Deduplication -> Classification & Embedding -> Capability Mapping -> Gap Analysis -> Clustering -> Synthesis -> Persistence
"""

import sys
import logging
from typing import Dict, Any, Optional
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from src.storage.database import DatabaseManager
from src.capability.capability_store import CapabilityStore
from src.ingestion.ingest_manager import IngestionManager
from src.detection.dedupe import SignalDeduplicator
from src.detection.signal_classifier import SignalClassifier
from src.gap_analysis.similarity import GapAnalyzer
from src.gap_analysis.clustering import TemporalSignalClusterer
from src.synthesis.llm_synthesizer import OpportunitySynthesizer

console = Console()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("Pipeline")


class IntelligenceEnginePipeline:
    def __init__(
        self,
        db_path: str = "data/intelligence_engine.db",
        seed_capabilities_path: str = "config/seed_capabilities.json",
        sources_config_path: str = "config/sources.yaml"
    ):
        self.db = DatabaseManager(db_path=db_path)
        self.capability_store = CapabilityStore(seed_path=seed_capabilities_path, db=self.db)
        self.ingestion_manager = IngestionManager(config_path=sources_config_path, db=self.db)
        self.deduplicator = SignalDeduplicator()
        self.classifier = SignalClassifier(embed_engine=self.capability_store.embed_engine)
        self.gap_analyzer = GapAnalyzer(
            capability_store=self.capability_store,
            embed_engine=self.capability_store.embed_engine
        )
        self.clusterer = TemporalSignalClusterer(embed_engine=self.capability_store.embed_engine)
        self.synthesizer = OpportunitySynthesizer(
            capability_store=self.capability_store,
            gap_analyzer=self.gap_analyzer
        )

    def run_cycle(self, limit_per_source: int = 10, verbose: bool = True) -> Dict[str, Any]:
        if verbose:
            console.print(Panel.fit("[bold cyan]Continuous Technology Intelligence Engine[/bold cyan]\n[dim]Signal-to-Opportunity Pipeline Execution[/dim]", border_style="cyan"))

        # Step 1: Ingestion
        if verbose:
            console.print("[bold yellow]► Step 1: Ingesting external sources (Papers, Patents, Funding, Policy, News)...[/bold yellow]")
        ingest_stats = self.ingestion_manager.run_ingestion_cycle(limit_per_source=limit_per_source)
        raw_signals = self.db.get_raw_signals(limit=200)
        if verbose:
            console.print(f"  ✓ Fetched [bold]{len(raw_signals)}[/bold] total raw signals across sources.")

        # Step 2: Deduplication
        if verbose:
            console.print("[bold yellow]► Step 2: Deduplicating signals (Exact hash & fuzzy Jaccard)...[/bold yellow]")
        unique_signals, dup_count = self.deduplicator.deduplicate(raw_signals)
        if verbose:
            console.print(f"  ✓ Retained [bold]{len(unique_signals)}[/bold] unique items (filtered {dup_count} duplicates).")

        # Step 3: Change Detection & Embedding
        if verbose:
            console.print("[bold yellow]► Step 3: Change detection filtering & semantic vector embedding...[/bold yellow]")
        processed_signals = self.classifier.process_and_embed_signals(unique_signals)
        self.db.save_processed_signals(processed_signals)

        change_signals = [s for s in processed_signals if s.is_change_signal]
        noise_count = len(processed_signals) - len(change_signals)
        if verbose:
            console.print(f"  ✓ Flagged [bold green]{len(change_signals)}[/bold green] genuine change signals (filtered [dim]{noise_count} routine noise items[/dim]).")

        # Step 4: Capability Mapping & Temporal Clustering
        if verbose:
            console.print("[bold yellow]► Step 4: Capability mapping & spatiotemporal signal clustering...[/bold yellow]")
        clusters = self.clusterer.cluster_signals(change_signals)
        if verbose:
            console.print(f"  ✓ Formed [bold]{len(clusters)}[/bold] multi-signal emerging technology clusters.")

        # Step 5: Evidence-Backed Opportunity Synthesis
        if verbose:
            console.print("[bold yellow]► Step 5: Evidence-backed opportunity synthesis & confidence scoring...[/bold yellow]")
        opportunities = self.synthesizer.synthesize_all(clusters)
        self.db.save_opportunities(opportunities)
        if verbose:
            console.print(f"  ✓ Synthesized & validated [bold green]{len(opportunities)}[/bold green] structured R&D opportunity records.")

        # Display Opportunities Table
        if verbose and opportunities:
            table = Table(title="Surfaced R&D Opportunities (Ranked by Confidence Score)", header_style="bold magenta")
            table.add_column("ID", style="cyan", width=10)
            table.add_column("Opportunity Title", style="bold white")
            table.add_column("Domain", style="green")
            table.add_column("Gap Type", style="yellow")
            table.add_column("Confidence", justify="right", style="bold cyan")
            table.add_column("Sources", justify="right", style="magenta")
            table.add_column("Adjacent Cap", style="blue")

            for opp in opportunities[:8]:
                table.add_row(
                    opp.opportunity_id,
                    opp.title[:45] + ("..." if len(opp.title) > 45 else ""),
                    opp.domain,
                    opp.gap_type.value,
                    f"{opp.confidence_score * 100:.1f}%",
                    str(len(opp.supporting_sources)),
                    opp.capability_adjacency[0] if opp.capability_adjacency else "N/A"
                )
            console.print(table)

        summary = {
            "ingested_raw": len(raw_signals),
            "unique_signals": len(unique_signals),
            "change_signals": len(change_signals),
            "clusters_formed": len(clusters),
            "opportunities_surfaced": len(opportunities),
            "top_opportunity": opportunities[0].opportunity_id if opportunities else None
        }
        return summary


if __name__ == "__main__":
    pipeline = IntelligenceEnginePipeline()
    summary = pipeline.run_cycle(limit_per_source=8, verbose=True)
