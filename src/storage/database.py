"""
Persistent Storage Engine (SQLite + JSON)
Handles thread-safe persistence and querying of raw signals, DNP capabilities, clusters, and opportunities.
"""

import json
import sqlite3
import os
import pandas as pd
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from pathlib import Path

from src.models import (
    RawSignal,
    ProcessedSignal,
    Capability,
    OpportunityRecord,
    TriageStatus,
    SourceType,
    SignalType,
    GapType,
)


class DatabaseManager:
    def __init__(self, db_path: str = "data/intelligence_engine.db"):
        self.db_path = db_path
        Path(os.path.dirname(self.db_path)).mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()

            # Raw signals table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS raw_signals (
                signal_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                raw_text TEXT NOT NULL,
                source_name TEXT NOT NULL,
                source_type TEXT NOT NULL,
                url TEXT NOT NULL,
                publish_date TEXT NOT NULL,
                geography TEXT DEFAULT 'Global',
                domain_tags TEXT,
                trust_weight REAL NOT NULL,
                raw_metadata TEXT,
                ingested_at TEXT NOT NULL
            )
            """)
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_raw_signals_title ON raw_signals(title);")

            # Processed signals table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS processed_signals (
                signal_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                clean_text TEXT NOT NULL,
                source_name TEXT NOT NULL,
                source_type TEXT NOT NULL,
                url TEXT NOT NULL,
                publish_date TEXT NOT NULL,
                geography TEXT DEFAULT 'Global',
                domain_tags TEXT,
                trust_weight REAL NOT NULL,
                is_change_signal INTEGER NOT NULL,
                change_confidence REAL NOT NULL,
                key_entities TEXT,
                novelty_score REAL NOT NULL,
                embedding_json TEXT
            )
            """)

            # Capabilities table (DNP Core Technology)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS capabilities (
                capability_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                domain TEXT NOT NULL,
                description TEXT NOT NULL,
                dnp_division TEXT DEFAULT 'DNP Central R&D (Japan)',
                key_technical_metrics TEXT,
                trl INTEGER NOT NULL,
                active_projects TEXT,
                internal_patents TEXT,
                embedding_json TEXT,
                created_at TEXT
            )
            """)

            # Opportunities table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS opportunities (
                opportunity_id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                domain TEXT NOT NULL,
                geography TEXT DEFAULT 'India & Global',
                first_detected_date TEXT NOT NULL,
                signal_type TEXT NOT NULL,
                supporting_sources_json TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                capability_adjacency_json TEXT NOT NULL,
                capability_matches_json TEXT,
                dnp_division_target TEXT DEFAULT 'DNP Japan',
                collaboration_hypothesis TEXT,
                gap_type TEXT NOT NULL,
                strategic_rationale TEXT NOT NULL,
                suggested_next_step TEXT NOT NULL,
                triage_status TEXT NOT NULL,
                researcher_notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """)

            # Triage history / audit log
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS triage_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                opportunity_id TEXT NOT NULL,
                previous_status TEXT,
                new_status TEXT NOT NULL,
                notes TEXT,
                timestamp TEXT NOT NULL
            )
            """)

            # Monthly reports table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS monthly_reports (
                report_id TEXT PRIMARY KEY,
                year_month TEXT NOT NULL UNIQUE,
                month_name TEXT NOT NULL,
                status TEXT NOT NULL,
                generated_at TEXT NOT NULL,
                summary_json TEXT,
                metrics_json TEXT,
                full_report_json TEXT,
                created_at TEXT,
                updated_at TEXT
            )
            """)

            # Monthly report sections
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS monthly_report_sections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT NOT NULL,
                section_key TEXT NOT NULL,
                section_number INTEGER NOT NULL,
                title TEXT NOT NULL,
                content_summary TEXT,
                data_json TEXT NOT NULL
            )
            """)

            # Report insights for human review
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS report_insights (
                insight_id TEXT PRIMARY KEY,
                report_id TEXT NOT NULL,
                year_month TEXT NOT NULL,
                insight_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                classification_label TEXT,
                status TEXT NOT NULL,
                reviewer_notes TEXT,
                confidence REAL,
                evidence_json TEXT,
                created_at TEXT
            )
            """)

            # Review audit log actions
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                insight_id TEXT NOT NULL,
                action TEXT NOT NULL,
                previous_status TEXT,
                new_status TEXT NOT NULL,
                reviewer_notes TEXT,
                timestamp TEXT NOT NULL
            )
            """)

            # Run safe migrations in case older database schema exists
            for col, tbl, dtype in [
                ("geography", "raw_signals", "TEXT DEFAULT 'Global'"),
                ("geography", "processed_signals", "TEXT DEFAULT 'Global'"),
                ("dnp_division", "capabilities", "TEXT DEFAULT 'DNP Central R&D (Japan)'"),
                ("geography", "opportunities", "TEXT DEFAULT 'India & Global'"),
                ("dnp_division_target", "opportunities", "TEXT DEFAULT 'DNP Japan'"),
                ("collaboration_hypothesis", "opportunities", "TEXT")
            ]:
                try:
                    cursor.execute(f"ALTER TABLE {tbl} ADD COLUMN {col} {dtype}")
                except sqlite3.OperationalError:
                    pass  # Column already exists

            conn.commit()

        # Seed initial rich signals if table is empty or sparse
        self._seed_initial_signals()

    def _seed_initial_signals(self):
        seed_path = Path("config/seed_signals.json")
        if not seed_path.exists():
            return
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                seed_data = json.load(f)
            
            with self._get_connection() as conn:
                cursor = conn.cursor()
                for s in seed_data:
                    cursor.execute("""
                    INSERT OR REPLACE INTO raw_signals (
                        signal_id, title, raw_text, source_name, source_type,
                        url, publish_date, geography, domain_tags, trust_weight, raw_metadata, ingested_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        s["signal_id"],
                        s["title"],
                        s["raw_text"],
                        s["source_name"],
                        s["source_type"],
                        s["url"],
                        s["publish_date"],
                        s.get("geography", "Global"),
                        json.dumps(s.get("domain_tags", [])),
                        s.get("trust_weight", 0.9),
                        json.dumps(s.get("raw_metadata", {})),
                        s.get("ingested_at", datetime.now(timezone.utc).isoformat())
                    ))
                conn.commit()
        except Exception as e:
            print(f"Notice: Seed signals initialization notice: {e}")

    def insert_raw_signal(self, s: RawSignal) -> bool:
        """Insert or update a single raw signal immediately with strict title deduplication."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT signal_id FROM raw_signals WHERE title = ?", (s.title,))
            existing = cursor.fetchone()
            if existing:
                cursor.execute("""
                UPDATE raw_signals
                SET ingested_at = ?, publish_date = ?, raw_text = ?, url = ?, source_name = ?, trust_weight = ?, raw_metadata = ?
                WHERE title = ?
                """, (
                    s.ingested_at,
                    s.publish_date,
                    s.raw_text,
                    s.url,
                    s.source_name,
                    s.trust_weight,
                    json.dumps(s.raw_metadata),
                    s.title
                ))
            else:
                cursor.execute("""
                INSERT INTO raw_signals (
                    signal_id, title, raw_text, source_name, source_type,
                    url, publish_date, geography, domain_tags, trust_weight, raw_metadata, ingested_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s.signal_id,
                    s.title,
                    s.raw_text,
                    s.source_name,
                    s.source_type.value if hasattr(s.source_type, 'value') else str(s.source_type),
                    s.url,
                    s.publish_date,
                    s.geography,
                    json.dumps(s.domain_tags),
                    s.trust_weight,
                    json.dumps(s.raw_metadata),
                    s.ingested_at
                ))
            conn.commit()
        return True

    def save_raw_signals(self, signals: List[RawSignal]) -> int:
        if not signals:
            return 0
        saved_count = 0
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for s in signals:
                cursor.execute("""
                INSERT OR REPLACE INTO raw_signals (
                    signal_id, title, raw_text, source_name, source_type,
                    url, publish_date, geography, domain_tags, trust_weight, raw_metadata, ingested_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s.signal_id,
                    s.title,
                    s.raw_text,
                    s.source_name,
                    s.source_type.value if hasattr(s.source_type, 'value') else str(s.source_type),
                    s.url,
                    s.publish_date,
                    s.geography,
                    json.dumps(s.domain_tags),
                    s.trust_weight,
                    json.dumps(s.raw_metadata),
                    s.ingested_at
                ))
                saved_count += 1
            conn.commit()
        return saved_count

    def get_raw_signals(self, limit: int = 500, sort_by_recent: bool = True) -> List[RawSignal]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if sort_by_recent:
                # Order by ingested_at DESC (recent real-time uploads/signups first), then publish_date DESC
                cursor.execute("SELECT * FROM raw_signals ORDER BY ingested_at DESC, publish_date DESC LIMIT ?", (limit,))
            else:
                cursor.execute("SELECT * FROM raw_signals ORDER BY publish_date DESC, ingested_at DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                st_raw = (r["source_type"] or "news").replace("-", "_")
                try:
                    st_enum = SourceType(st_raw)
                except Exception:
                    st_enum = SourceType.PEER_REVIEWED if "peer" in st_raw else SourceType.PATENT if "patent" in st_raw else SourceType.STARTUP if "startup" in st_raw else SourceType.FUNDING if "funding" in st_raw else SourceType.NEWS

                results.append(RawSignal(
                    signal_id=r["signal_id"],
                    title=r["title"],
                    raw_text=r["raw_text"],
                    source_name=r["source_name"],
                    source_type=st_enum,
                    url=r["url"],
                    publish_date=r["publish_date"],
                    geography=r["geography"] if "geography" in r.keys() and r["geography"] else "Global",
                    domain_tags=json.loads(r["domain_tags"] or "[]"),
                    trust_weight=r["trust_weight"],
                    raw_metadata=json.loads(r["raw_metadata"] or "{}"),
                    ingested_at=r["ingested_at"]
                ))
            return results

    def save_processed_signals(self, signals: List[ProcessedSignal]) -> int:
        if not signals:
            return 0
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for s in signals:
                cursor.execute("""
                INSERT OR REPLACE INTO processed_signals (
                    signal_id, title, clean_text, source_name, source_type,
                    url, publish_date, geography, domain_tags, trust_weight, is_change_signal,
                    change_confidence, key_entities, novelty_score, embedding_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s.signal_id,
                    s.title,
                    s.clean_text,
                    s.source_name,
                    s.source_type.value if hasattr(s.source_type, 'value') else str(s.source_type),
                    s.url,
                    s.publish_date,
                    s.geography,
                    json.dumps(s.domain_tags),
                    s.trust_weight,
                    1 if s.is_change_signal else 0,
                    s.change_confidence,
                    json.dumps(s.key_entities),
                    s.novelty_score,
                    json.dumps(s.embedding) if s.embedding is not None else None
                ))
            conn.commit()
        return len(signals)

    def get_processed_signals(self, change_signals_only: bool = False) -> List[ProcessedSignal]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM processed_signals"
            params = []
            if change_signals_only:
                query += " WHERE is_change_signal = 1"
            query += " ORDER BY publish_date DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                st_raw = (r["source_type"] or "news").replace("-", "_")
                try:
                    st_enum = SourceType(st_raw)
                except Exception:
                    st_enum = SourceType.PEER_REVIEWED if "peer" in st_raw else SourceType.PATENT if "patent" in st_raw else SourceType.STARTUP if "startup" in st_raw else SourceType.FUNDING if "funding" in st_raw else SourceType.NEWS

                results.append(ProcessedSignal(
                    signal_id=r["signal_id"],
                    title=r["title"],
                    clean_text=r["clean_text"],
                    source_name=r["source_name"],
                    source_type=st_enum,
                    url=r["url"],
                    publish_date=r["publish_date"],
                    geography=r["geography"] if "geography" in r.keys() and r["geography"] else "Global",
                    domain_tags=json.loads(r["domain_tags"] or "[]"),
                    trust_weight=r["trust_weight"],
                    is_change_signal=bool(r["is_change_signal"]),
                    change_confidence=r["change_confidence"],
                    key_entities=json.loads(r["key_entities"] or "[]"),
                    novelty_score=r["novelty_score"],
                    embedding=json.loads(r["embedding_json"]) if r["embedding_json"] else None
                ))
            return results

    def save_capabilities(self, capabilities: List[Capability]) -> int:
        if not capabilities:
            return 0
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for c in capabilities:
                cursor.execute("""
                INSERT OR REPLACE INTO capabilities (
                    capability_id, name, domain, description, dnp_division, key_technical_metrics,
                    trl, active_projects, internal_patents, embedding_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    c.capability_id,
                    c.name,
                    json.dumps(c.domain),
                    c.description,
                    c.dnp_division or "DNP Central R&D (Japan)",
                    json.dumps(c.key_technical_metrics),
                    c.trl,
                    json.dumps(c.active_projects),
                    json.dumps(c.internal_patents),
                    json.dumps(c.embedding) if c.embedding is not None else None,
                    c.created_at or datetime.now(timezone.utc).isoformat()
                ))
            conn.commit()
        return len(capabilities)

    def get_capabilities(self) -> List[Capability]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM capabilities ORDER BY capability_id ASC")
            rows = cursor.fetchall()
            results = []
            for r in rows:
                results.append(Capability(
                    capability_id=r["capability_id"],
                    name=r["name"],
                    domain=json.loads(r["domain"] or "[]"),
                    description=r["description"],
                    dnp_division=r["dnp_division"] if "dnp_division" in r.keys() else "DNP Central R&D (Japan)",
                    key_technical_metrics=json.loads(r["key_technical_metrics"] or "{}"),
                    trl=r["trl"],
                    active_projects=json.loads(r["active_projects"] or "[]"),
                    internal_patents=json.loads(r["internal_patents"] or "[]"),
                    embedding=json.loads(r["embedding_json"]) if r["embedding_json"] else None,
                    created_at=r["created_at"]
                ))
            return results

    def save_opportunities(self, opportunities: List[OpportunityRecord]) -> int:
        if not opportunities:
            return 0
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for opp in opportunities:
                cursor.execute("""
                INSERT OR REPLACE INTO opportunities (
                    opportunity_id, title, domain, geography, first_detected_date, signal_type,
                    supporting_sources_json, confidence_score, capability_adjacency_json,
                    capability_matches_json, dnp_division_target, collaboration_hypothesis,
                    gap_type, strategic_rationale, suggested_next_step,
                    triage_status, researcher_notes, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    opp.opportunity_id,
                    opp.title,
                    opp.domain,
                    opp.geography,
                    opp.first_detected_date,
                    opp.signal_type.value if hasattr(opp.signal_type, 'value') else str(opp.signal_type),
                    json.dumps([s.model_dump() for s in opp.supporting_sources]),
                    opp.confidence_score,
                    json.dumps(opp.capability_adjacency),
                    json.dumps([m.model_dump() for m in opp.capability_matches]),
                    opp.dnp_division_target,
                    opp.collaboration_hypothesis,
                    opp.gap_type.value if hasattr(opp.gap_type, 'value') else str(opp.gap_type),
                    opp.strategic_rationale,
                    opp.suggested_next_step,
                    opp.triage_status.value if hasattr(opp.triage_status, 'value') else str(opp.triage_status),
                    opp.researcher_notes,
                    opp.created_at,
                    opp.updated_at
                ))
            conn.commit()
        return len(opportunities)

    def get_opportunities(self, status: Optional[TriageStatus] = None) -> List[OpportunityRecord]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM opportunities"
            params = []
            if status:
                query += " WHERE triage_status = ?"
                params.append(status.value if hasattr(status, 'value') else str(status))
            query += " ORDER BY confidence_score DESC, first_detected_date DESC"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            results = []
            for r in rows:
                supporting = json.loads(r["supporting_sources_json"] or "[]")
                matches = json.loads(r["capability_matches_json"] or "[]")
                results.append(OpportunityRecord(
                    opportunity_id=r["opportunity_id"],
                    title=r["title"],
                    domain=r["domain"],
                    geography=r["geography"] if "geography" in r.keys() and r["geography"] else "India & Global",
                    first_detected_date=r["first_detected_date"],
                    signal_type=SignalType(r["signal_type"]),
                    supporting_sources=supporting,
                    confidence_score=r["confidence_score"],
                    capability_adjacency=json.loads(r["capability_adjacency_json"] or "[]"),
                    capability_matches=matches,
                    dnp_division_target=r["dnp_division_target"] if "dnp_division_target" in r.keys() else "DNP Japan",
                    collaboration_hypothesis=r["collaboration_hypothesis"] if "collaboration_hypothesis" in r.keys() else None,
                    gap_type=GapType(r["gap_type"]),
                    strategic_rationale=r["strategic_rationale"],
                    suggested_next_step=r["suggested_next_step"],
                    triage_status=TriageStatus(r["triage_status"]),
                    researcher_notes=r["researcher_notes"],
                    created_at=r["created_at"],
                    updated_at=r["updated_at"]
                ))
            return results

    def update_opportunity_triage(self, opportunity_id: str, new_status: TriageStatus, notes: Optional[str] = None):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT triage_status FROM opportunities WHERE opportunity_id = ?", (opportunity_id,))
            row = cursor.fetchone()
            prev_status = row["triage_status"] if row else None
            now = datetime.now(timezone.utc).isoformat()

            cursor.execute("""
            UPDATE opportunities 
            SET triage_status = ?, researcher_notes = COALESCE(?, researcher_notes), updated_at = ?
            WHERE opportunity_id = ?
            """, (
                new_status.value if hasattr(new_status, 'value') else str(new_status),
                notes,
                now,
                opportunity_id
            ))

            cursor.execute("""
            INSERT INTO triage_history (opportunity_id, previous_status, new_status, notes, timestamp)
            VALUES (?, ?, ?, ?, ?)
            """, (
                opportunity_id,
                prev_status,
                new_status.value if hasattr(new_status, 'value') else str(new_status),
                notes,
                now
            ))
            conn.commit()

    def get_summary_stats(self) -> Dict[str, Any]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM raw_signals")
            raw_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM processed_signals WHERE is_change_signal = 1")
            change_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM capabilities")
            caps_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM opportunities")
            opps_count = cursor.fetchone()[0]

            cursor.execute("SELECT triage_status, COUNT(*) FROM opportunities GROUP BY triage_status")
            triage_breakdown = dict(cursor.fetchall())

            cursor.execute("SELECT source_type, COUNT(*) FROM processed_signals WHERE is_change_signal = 1 GROUP BY source_type")
            source_breakdown = dict(cursor.fetchall())

            return {
                "raw_signals": raw_count,
                "change_signals": change_count,
                "capabilities": caps_count,
                "opportunities": opps_count,
                "triage_breakdown": triage_breakdown,
                "source_breakdown": source_breakdown
            }

    def execute_query(self, query: str) -> pd.DataFrame:
        """Execute a read-only SQL query and return results as a pandas DataFrame."""
        import pandas as pd
        with self._get_connection() as conn:
            return pd.read_sql_query(query, conn)
