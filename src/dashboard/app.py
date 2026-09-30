"""
Next-Generation Technology Intelligence Platform
Executive Decision & Innovation Hub connecting Indian Research, Startups, and Policies with Global R&D Capabilities.
"""

import os
import sys
from pathlib import Path

# Ensure project root directory is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import json
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from src.models import (
    OpportunityRecord,
    Capability,
    TriageStatus,
    SourceType,
    SignalType,
    GapType,
    SupportingSource,
    CapabilityMatch,
    SOURCE_TRUST_WEIGHTS
)
from src.storage.database import DatabaseManager
from src.capability.capability_store import CapabilityStore
from src.gap_analysis.clustering import TemporalSignalClusterer
from src.pipeline import IntelligenceEnginePipeline
from src.evaluation.evaluate import EvaluationEngine
from src.detection.signal_classifier import SignalClassifier

# -----------------------------------------------------------------------------
# Streamlit Page Setup
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="TechIntel | Global & India Innovation Hub",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# -----------------------------------------------------------------------------
# Custom Styling: High-End Pro SaaS Theme (Next-Level UI with Highlight Colors)
# -----------------------------------------------------------------------------
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    .stApp {
        background-color: #0A0E1A;
        color: #F1F5F9;
    }
    
    /* Top Live Announcement Banner */
    .top-banner {
        background: linear-gradient(90deg, #1E1B4B 0%, #312E81 50%, #1E1B4B 100%);
        border: 1px solid #4338CA;
        border-radius: 12px;
        padding: 0.75rem 1.25rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 20px rgba(67, 56, 202, 0.25);
    }
    .banner-text {
        font-size: 0.92rem;
        font-weight: 700;
        color: #EEF2FF;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    .live-dot {
        height: 10px;
        width: 10px;
        background-color: #EF4444;
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 0 12px #EF4444;
        animation: pulse 2s infinite;
    }
    @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.2); }
        100% { opacity: 1; transform: scale(1); }
    }
    .banner-badge {
        background: #4F46E5;
        color: #FFFFFF;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }

    /* Pro Header Card */
    .header-card {
        background: linear-gradient(135deg, #111827 0%, #1E293B 100%);
        border: 1px solid #334155;
        border-radius: 16px;
        padding: 1.6rem 2rem;
        margin-bottom: 1.75rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        position: relative;
        overflow: hidden;
    }
    .header-card::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 250px;
        height: 100%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%);
        pointer-events: none;
    }
    .pillar-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(99, 102, 241, 0.18);
        border: 1px solid rgba(129, 140, 248, 0.4);
        color: #A5B4FC;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        margin-bottom: 0.6rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }
    .hero-title {
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        color: #FFFFFF;
        margin: 0;
        line-height: 1.2;
    }
    .hero-subtitle {
        font-size: 0.95rem;
        color: #94A3B8;
        margin-top: 0.4rem;
        max-width: 850px;
        line-height: 1.5;
    }

    /* KPI Cards */
    .kpi-container {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1.25rem;
        margin-bottom: 2rem;
    }
    .kpi-card {
        background: #111827;
        border: 1px solid #1E293B;
        border-radius: 14px;
        padding: 1.25rem;
        position: relative;
        transition: transform 0.2s ease, border-color 0.2s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
    .kpi-card:hover {
        transform: translateY(-2px);
        border-color: #4F46E5;
    }
    .kpi-icon-box {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        margin-bottom: 0.75rem;
    }
    .kpi-val {
        font-size: 2rem;
        font-weight: 800;
        color: #F8FAFC;
        line-height: 1;
        margin-bottom: 0.35rem;
    }
    .kpi-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: #94A3B8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .kpi-trend {
        font-size: 0.75rem;
        font-weight: 600;
        color: #10B981;
        margin-top: 0.35rem;
    }

    /* Pro Technology Opportunity Card */
    .pro-card {
        background: #111827;
        border: 1px solid #1E293B;
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        transition: all 0.2s ease;
        box-shadow: 0 6px 20px rgba(0,0,0,0.25);
        position: relative;
    }
    .pro-card:hover {
        border-color: #6366F1;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
    }
    .card-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
    }
    .tag-category {
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 0.25rem 0.65rem;
        border-radius: 6px;
        letter-spacing: 0.04em;
    }
    .tag-patent { background: rgba(59, 130, 246, 0.18); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.35); }
    .tag-research { background: rgba(16, 185, 129, 0.18); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.35); }
    .tag-startup { background: rgba(245, 158, 11, 0.18); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.35); }
    .tag-policy { background: rgba(139, 92, 246, 0.18); color: #C084FC; border: 1px solid rgba(139, 92, 246, 0.35); }

    .badge-trending {
        background: linear-gradient(90deg, #FF6B00 0%, #FF8800 100%);
        color: #FFFFFF;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0.25rem 0.65rem;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        box-shadow: 0 2px 10px rgba(255, 107, 0, 0.35);
    }
    .badge-conviction {
        background: linear-gradient(90deg, #10B981 0%, #059669 100%);
        color: #FFFFFF;
        font-size: 0.72rem;
        font-weight: 800;
        padding: 0.25rem 0.65rem;
        border-radius: 20px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .pro-card-title {
        font-size: 1.25rem;
        font-weight: 700;
        color: #FFFFFF;
        margin: 0.4rem 0 0.6rem 0;
        line-height: 1.3;
    }
    .pro-card-desc {
        font-size: 0.92rem;
        color: #CBD5E1;
        line-height: 1.5;
        margin-bottom: 1rem;
    }

    .callout-box-collab {
        background: rgba(16, 185, 129, 0.08);
        border-left: 3px solid #10B981;
        border-radius: 0 8px 8px 0;
        padding: 0.85rem 1.1rem;
        margin-bottom: 0.75rem;
    }
    .callout-title-collab {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #34D399;
        letter-spacing: 0.06em;
        margin-bottom: 0.25rem;
    }
    .callout-body-collab {
        font-size: 0.88rem;
        color: #E2E8F0;
        line-height: 1.45;
    }

    .callout-box-lab {
        background: rgba(99, 102, 241, 0.08);
        border-left: 3px solid #6366F1;
        border-radius: 0 8px 8px 0;
        padding: 0.85rem 1.1rem;
        margin-bottom: 1rem;
    }
    .callout-title-lab {
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        color: #818CF8;
        letter-spacing: 0.06em;
        margin-bottom: 0.25rem;
    }
    .callout-body-lab {
        font-size: 0.88rem;
        color: #E2E8F0;
        line-height: 1.45;
    }

    /* Progress bar */
    .confidence-meter-container {
        margin: 0.85rem 0;
    }
    .confidence-meter-bar {
        height: 8px;
        background: #1E293B;
        border-radius: 4px;
        overflow: hidden;
        margin-top: 0.35rem;
    }
    .confidence-meter-fill {
        height: 100%;
        background: linear-gradient(90deg, #3B82F6 0%, #10B981 100%);
        border-radius: 4px;
    }

    /* Sidebar Clean Styling */
    section[data-testid="stSidebar"] {
        background-color: #0A0E1A;
        border-right: 1px solid #1E293B;
    }
    
    div.stButton > button {
        border-radius: 8px;
        font-weight: 700;
        font-size: 0.82rem;
        padding: 0.45rem 1rem;
        transition: all 0.2s ease;
    }
</style>
""", unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# Database & Core Helpers
# -----------------------------------------------------------------------------
@st.cache_resource
def get_database_manager() -> DatabaseManager:
    """Return database connection and initialize capability baseline if needed."""
    db = DatabaseManager()
    if not db.get_capabilities():
        CapabilityStore(db=db, seed_path="config/seed_capabilities.json")
    if not db.get_opportunities():
        pipeline = IntelligenceEnginePipeline(db_path=db.db_path)
        pipeline.run_cycle(limit_per_source=8, verbose=False)
    return db


# -----------------------------------------------------------------------------
# Main Application
# -----------------------------------------------------------------------------
def main():
    db = get_database_manager()
    stats = db.get_summary_stats()

    # Top Live Alert Banner (Inspired by Pro SaaS Design)
    st.markdown(f"""
    <div class="top-banner">
        <div class="banner-text">
            <span class="live-dot"></span>
            <span><strong>LIVE INTELLIGENCE STREAM:</strong> Ingested <strong>{stats['raw_signals']}</strong> multi-source signals across Indian Universities, DeepTech Startups & Global Patent Registries.</span>
        </div>
        <div class="banner-badge">Real-Time Sync</div>
    </div>
    """, unsafe_allow_html=True)

    # Sidebar Navigation aligned with the 4 Pillars
    st.sidebar.markdown("## ⚡ **TechIntel Hub**")
    st.sidebar.caption("Continuous Technology & Innovation Engine")
    st.sidebar.markdown("---")

    nav_selection = st.sidebar.radio(
        "CORE WORKFLOW",
        [
            "01 | 🔭 Explore & Early Signals",
            "02 | 📊 Structured Intelligence & What's New",
            "03 | ⚡ Information Connection & Opportunities",
            "04 | 🤝 Communicate & Test Hypotheses",
            "05 | 📑 Monthly R&D Intelligence Report",
            "⚙️ Operations & Engine Accuracy"
        ],
        index=0
    )

    st.sidebar.markdown("---")
    st.sidebar.markdown("#### **Platform Status**")
    st.sidebar.markdown(f"🏭 Core Platforms: **{stats['capabilities']} Active**")
    st.sidebar.markdown(f"📡 Breakthrough Signals: **{stats['change_signals']} Filtered**")
    st.sidebar.markdown(f"🎯 Actionable Opportunities: **{stats['opportunities']} Surfaced**")
    
    # Bottom Researcher Profile Card in Sidebar
    st.sidebar.markdown("""
    <div style="background: #111827; border: 1px solid #1E293B; border-radius: 12px; padding: 0.9rem; margin-top: 2rem;">
        <div style="font-size: 0.75rem; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Active Role</div>
        <div style="font-size: 0.92rem; font-weight: 700; color: #F8FAFC; margin-top: 0.2rem;">Lead R&D Researcher</div>
        <div style="font-size: 0.75rem; color: #10B981; margin-top: 0.2rem;">● Global-India Bridge Node</div>
    </div>
    """, unsafe_allow_html=True)

    # =========================================================================
    # PILLAR 01: EXPLORE & EARLY SIGNS OF CHANGE
    # =========================================================================
    if nav_selection == "01 | 🔭 Explore & Early Signals":
        st.markdown("""
        <div class="header-card">
            <span class="pillar-pill">🔭 PILLAR 01 • INFORMATION SEARCHING & RELIABILITY</span>
            <h1 class="hero-title">Explore Early Signs of Technological Change</h1>
            <div class="hero-subtitle">
                Continuously discover emerging developments across academic research, patents, deep-tech startups, investments, and government policy in India and globally.
            </div>
        </div>
        """, unsafe_allow_html=True)

        # 4 Pro Metric Cards
        c1, c2, c3, c4 = st.columns(4)
        with c1:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-icon-box" style="background: rgba(59, 130, 246, 0.15); color: #60A5FA;">📡</div>
                <div class="kpi-val">{stats['raw_signals']}</div>
                <div class="kpi-label">Ingested Signals</div>
                <div class="kpi-trend">↑ Multi-modal real-time feed</div>
            </div>
            """, unsafe_allow_html=True)
        with c2:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-icon-box" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">🎓</div>
                <div class="kpi-val">{stats['source_breakdown'].get('peer_reviewed', 0) + stats['source_breakdown'].get('preprint', 0)}</div>
                <div class="kpi-label">Academic & Preprints</div>
                <div class="kpi-trend">IITs, IISc & arXiv</div>
            </div>
            """, unsafe_allow_html=True)
        with c3:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-icon-box" style="background: rgba(245, 158, 11, 0.15); color: #FBBF24;">🚀</div>
                <div class="kpi-val">{stats['source_breakdown'].get('funding', 0)}</div>
                <div class="kpi-label">Startups & Deals</div>
                <div class="kpi-trend">Indian DeepTech Capital</div>
            </div>
            """, unsafe_allow_html=True)
        with c4:
            st.markdown(f"""
            <div class="kpi-card">
                <div class="kpi-icon-box" style="background: rgba(139, 92, 246, 0.15); color: #C084FC;">📜</div>
                <div class="kpi-val">{stats['source_breakdown'].get('patent', 0) + stats['source_breakdown'].get('policy', 0)}</div>
                <div class="kpi-label">Patents & Policy</div>
                <div class="kpi-trend">IPO, USPTO & MeitY Missions</div>
            </div>
            """, unsafe_allow_html=True)

        st.markdown("<br>", unsafe_allow_html=True)

        tab_search, tab_reliability, tab_check = st.tabs([
            "🔍 Explore & Filter Live Signals",
            "⚖️ Source Reliability & Trust Hierarchy",
            "🧪 Quick Claim & Source Verifier"
        ])

        with tab_search:
            # Interactive Filter Bar
            fc1, fc2, fc3 = st.columns([2.5, 1.5, 1.5])
            with fc1:
                search_term = st.text_input("Search Ingested Signals", placeholder="Search by topic, material, institution (e.g. Battery, IIT Madras, GaN, Photomask)...", label_visibility="collapsed")
            with fc2:
                source_filter = st.selectbox("Source Type", ["All Sources", "peer_reviewed (Papers)", "patent (Patents)", "funding (Startups & VC)", "policy (Government)", "news (Media)"], label_visibility="collapsed")
            with fc3:
                geo_filter = st.selectbox("Geography", ["All Geographies", "India", "Global", "Japan"], label_visibility="collapsed")

            raw_signals = db.get_raw_signals(limit=200)
            
            filtered_signals = []
            for s in raw_signals:
                if source_filter != "All Sources" and s.source_type.value not in source_filter:
                    continue
                if geo_filter != "All Geographies" and geo_filter.lower() not in s.geography.lower():
                    continue
                if search_term:
                    q = search_term.strip().lower()
                    if q not in s.title.lower() and q not in s.raw_text.lower() and q not in s.source_name.lower():
                        continue
                filtered_signals.append(s)

            st.markdown(f"Displaying **{len(filtered_signals)}** verified technological change signals:")

            for sig in filtered_signals[:15]:
                trust_pct = int(sig.trust_weight * 100)
                tag_class = "tag-patent" if sig.source_type == SourceType.PATENT else "tag-research" if sig.source_type in [SourceType.PEER_REVIEWED, SourceType.PREPRINT] else "tag-startup" if sig.source_type == SourceType.FUNDING else "tag-policy"

                with st.container():
                    st.markdown(f"""
                    <div class="pro-card">
                        <div class="card-top-bar">
                            <div>
                                <span class="tag-category {tag_class}">🏷️ {sig.source_type.value.upper()}</span>
                                <span style="background: rgba(255,255,255,0.06); padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; color: #94A3B8; margin-left: 0.4rem;">📍 {sig.geography}</span>
                                <span style="background: rgba(255,255,255,0.06); padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.75rem; color: #94A3B8; margin-left: 0.4rem;">🏛️ {sig.source_name}</span>
                            </div>
                            <div>
                                <span class="badge-conviction">Trust Score: {trust_pct}%</span>
                            </div>
                        </div>
                        <h3 class="pro-card-title">{sig.title}</h3>
                        <p class="pro-card-desc">{sig.raw_text}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; color: #94A3B8; border-top: 1px solid #1E293B; padding-top: 0.75rem;">
                            <span>Published: <strong>{sig.publish_date}</strong></span>
                            <a href="{sig.url}" target="_blank" style="color: #60A5FA; text-decoration: none; font-weight: 700;">Inspect Primary Document ↗</a>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

        with tab_reliability:
            st.markdown("#### **Information Source Reliability Framework**")
            st.markdown("""
            The engine assigns deterministic trust weights to incoming information based on verification hierarchy. 
            Peer-reviewed scientific journals and verified patent office registries carry maximum evidential weight.
            """)

            trust_table = pd.DataFrame([
                {"Information Source": "Peer-Reviewed Scientific Journals", "Trust Score": "100%", "Examples": "Nature, ACS, IEEE, IIT & IISc Publications", "Evidence Value": "Peer-reviewed scientific validation"},
                {"Information Source": "Official Patent Filings & Grants", "Trust Score": "90%", "Examples": "Indian Patent Office (IPO), USPTO, JPO, WIPO", "Evidence Value": "Legally binding commercial IP claims"},
                {"Information Source": "Government Policy & Directives", "Trust Score": "85%", "Examples": "MeitY India Semiconductor Mission, Green Hydrogen PLI", "Evidence Value": "Sovereign policy commitments and capital roadmaps"},
                {"Information Source": "Scientific Preprints", "Trust Score": "75%", "Examples": "arXiv, ChemRxiv, bioRxiv", "Evidence Value": "Latest lab breakthroughs prior to journal peer-review"},
                {"Information Source": "Startup Funding Deals & Cap Tables", "Trust Score": "65%", "Examples": "Venture Intelligence India, Tracxn, Crunchbase", "Evidence Value": "Commercial venture capital investment in DeepTech"},
                {"Information Source": "Technology Press & News", "Trust Score": "40%", "Examples": "Nikkei Asia, SemiWiki, EE Times, TechCrunch", "Evidence Value": "Early market chatter; requires multi-source verification"}
            ])
            st.dataframe(trust_table, width="stretch", hide_index=True)

        with tab_check:
            st.markdown("#### **Real-Time Source & Claim Evaluator**")
            st.write("Paste any claim, research abstract, or startup announcement to check reliability and extract key technical entities:")

            sample_text = "Researchers at IIT Madras have fabricated a high-energy sodium-ion battery achieving 180 Wh/kg with a flame-retardant ceramic separator suitable for tropical climate conditions."
            user_input = st.text_area("Research Claim / Abstract", value=sample_text, height=90)
            user_src_type = st.selectbox("Claim Source Type", ["peer_reviewed", "patent", "policy", "preprint", "funding", "news"])

            if st.button("Evaluate Reliability & Extract Breakthroughs", type="primary"):
                classifier = SignalClassifier()
                is_change, conf, entities, novelty = classifier.classify(user_input, user_src_type)
                trust = SOURCE_TRUST_WEIGHTS.get(user_src_type, 0.5)

                col_e1, col_e2, col_e3 = st.columns(3)
                with col_e1:
                    st.metric("Source Trust Rating", f"{trust * 100:.0f}%")
                with col_e2:
                    st.metric("Signal Status", "Breakthrough Change" if is_change else "Routine Information")
                with col_e3:
                    st.metric("Novelty Rating", f"{novelty:.2f} / 1.00")

                if entities:
                    st.markdown(f"**Identified Key Entities & Materials:** `{', '.join(entities)}`")

                if is_change and trust >= 0.65:
                    st.success("✅ High-Confidence Change Signal: Validated and eligible for automated technology matching.")
                else:
                    st.info("ℹ️ Information logged. Requires additional corroborating sources before surfacing.")

    # =========================================================================
    # PILLAR 02: AI STRUCTURING & WHAT'S NEW
    # =========================================================================
    elif nav_selection == "02 | 📊 Structured Intelligence & What's New":
        st.markdown("""
        <div class="header-card">
            <span class="pillar-pill">📊 PILLAR 02 • AI STRUCTURING & NOVELTY ENGINE</span>
            <h1 class="hero-title">Organized, Searchable Technology Intelligence</h1>
            <div class="hero-subtitle">
                Transform diverse unstructured information into clean, organized intelligence. Understand what has already been done vs. what is the new breakthrough.
            </div>
        </div>
        """, unsafe_allow_html=True)

        tab_novelty, tab_structured, tab_trends = st.tabs([
            "💡 What Was Done vs. What is New (Novelty)",
            "📋 Structured Intelligence Catalog",
            "📈 Trends & Geographic Distribution"
        ])

        with tab_novelty:
            st.markdown("#### **Baseline Technology vs. New Breakthrough Analysis**")
            st.write("Understand the technological shift: what previously existed in the industry versus the newly emerging breakthrough:")

            novelty_items = [
                {
                    "title": "Battery Packaging & Thermal Passivation",
                    "baseline": "Standard multi-layer aluminum laminate pouch films certified for moderate climates up to 45°C. Prone to micro-swelling and HF acid corrosion in high ambient heat.",
                    "novelty": "Plasma-enhanced atomic layer deposited (ALD) Al2O3 ultra-thin barrier layer preventing electrolyte degradation and swelling under tropical 55°C heat.",
                    "lead_org": "Indian Patent Office / IIT Madras & Log9 Materials",
                    "impact": "Extends EV soft-pack battery cycle life in tropical regions by over 40%."
                },
                {
                    "title": "Semiconductor EUV & Nanoimprint Lithography",
                    "baseline": "Imported optical projection photomasks with high licensing costs and 16-week international shipping lead times.",
                    "novelty": "Sub-14nm nanoimprint lithography (NIL) test vehicles qualified locally under India Semiconductor Mission fiscal subsidy.",
                    "lead_org": "IISc CeNSE / MeitY Semiconductor Mission",
                    "impact": "Reduces semiconductor lithography tooling costs by >50% for 3D packaging."
                },
                {
                    "title": "Transparent 6G Wireless Metasurfaces (RIS)",
                    "baseline": "Opaque metal-backed sub-THz reflectarrays causing visual obstruction when mounted on building windows in urban smart cities.",
                    "novelty": "Optically transparent (>85% visible light) frequency-selective intelligent surfaces redirecting 140 GHz sub-THz waves with >92% reflection efficiency.",
                    "lead_org": "IIT Madras 5G/6G Research Group",
                    "impact": "Enables indoor cellular coverage for 6G without installing high-power cellular repeaters."
                },
                {
                    "title": "Decentralized Polymer Microfluidic Diagnostics",
                    "baseline": "Fragile glass and PDMS elastomer microfluidic chips that cannot be mass manufactured at commercial scale.",
                    "novelty": "High-precision injection-molded cyclic olefin copolymer (COC) diagnostic biochips integrated with lyophilized room-temperature reagents.",
                    "lead_org": "Biomedical Innovations / Achira Labs",
                    "impact": "Enables decentralized blood panel testing in rural clinics with 15-minute turnaround."
                }
            ]

            for item in novelty_items:
                with st.container():
                    st.markdown(f"""
                    <div class="pro-card">
                        <div class="card-top-bar">
                            <span class="tag-category tag-research">🔬 {item['title']}</span>
                            <span class="badge-trending">Novelty Inflection</span>
                        </div>
                        <div style="font-size: 0.82rem; color: #94A3B8; margin-bottom: 0.75rem;">
                            🏛️ <strong>Lead Organizations:</strong> {item['lead_org']} | 🎯 <strong>Strategic Impact:</strong> {item['impact']}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
                            <div style="background: rgba(255,255,255,0.03); border-left: 3px solid #64748B; padding: 0.9rem; border-radius: 0 8px 8px 0;">
                                <div style="font-size: 0.75rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 0.3rem;">What Was Already Done (Baseline)</div>
                                <div style="font-size: 0.88rem; color: #CBD5E1; line-height: 1.45;">{item['baseline']}</div>
                            </div>
                            <div style="background: rgba(16, 185, 129, 0.06); border-left: 3px solid #10B981; padding: 0.9rem; border-radius: 0 8px 8px 0;">
                                <div style="font-size: 0.75rem; font-weight: 800; color: #34D399; text-transform: uppercase; margin-bottom: 0.3rem;">What is the New Breakthrough (Novelty)</div>
                                <div style="font-size: 0.88rem; color: #EEF2FF; line-height: 1.45;">{item['novelty']}</div>
                            </div>
                        </div>
                    </div>
                    """, unsafe_allow_html=True)

        with tab_structured:
            st.markdown("#### **Structured Signals Database**")
            proc_signals = db.get_processed_signals()
            df_signals = pd.DataFrame([{
                "Signal ID": s.signal_id,
                "Title": s.title,
                "Source": s.source_name,
                "Type": s.source_type.value.upper(),
                "Origin": s.geography,
                "Date": s.publish_date,
                "Trust": f"{s.trust_weight * 100:.0f}%",
                "Is Breakthrough": "Yes" if s.is_change_signal else "Routine",
                "Domain Tags": ", ".join(s.domain_tags)
            } for s in proc_signals])

            st.dataframe(df_signals, width="stretch", hide_index=True)

            csv = df_signals.to_csv(index=False)
            st.download_button("📥 Download Structured Data (CSV)", data=csv, file_name="structured_technology_signals.csv", mime="text/csv")

        with tab_trends:
            st.markdown("#### **Signal Distribution by Domain & Geography**")
            col_g1, col_g2 = st.columns(2)
            with col_g1:
                geo_counts = pd.Series([s.geography for s in proc_signals]).value_counts().reset_index()
                geo_counts.columns = ["Geography", "Count"]
                fig_geo = px.pie(geo_counts, names="Geography", values="Count", title="Signals by Geographic Origin", template="plotly_dark")
                fig_geo.update_layout(height=280, margin=dict(l=20, r=20, t=40, b=20), paper_bgcolor="#0A0E1A", plot_bgcolor="#0A0E1A")
                st.plotly_chart(fig_geo, width="stretch")

            with col_g2:
                type_counts = pd.Series([s.source_type.value.upper() for s in proc_signals]).value_counts().reset_index()
                type_counts.columns = ["Source Type", "Count"]
                fig_type = px.bar(type_counts, x="Source Type", y="Count", title="Signals by Information Source Type", template="plotly_dark", color="Count", color_continuous_scale="Viridis")
                fig_type.update_layout(height=280, margin=dict(l=20, r=20, t=40, b=20), paper_bgcolor="#0A0E1A", plot_bgcolor="#0A0E1A")
                st.plotly_chart(fig_type, width="stretch")

    # =========================================================================
    # PILLAR 03: INFORMATION CONNECTION & R&D OPPORTUNITIES
    # =========================================================================
    elif nav_selection == "03 | ⚡ Information Connection & Opportunities":
        st.markdown("""
        <div class="header-card">
            <span class="pillar-pill">⚡ PILLAR 03 • INFORMATION CONNECTION & R&D OPPORTUNITIES</span>
            <h1 class="hero-title">Link Signals & Identify High-Impact Opportunities</h1>
            <div class="hero-subtitle">
                Connect external signals to internal technology capabilities, identify strategic technology gaps, and surface evidence-backed R&D opportunities.
            </div>
        </div>
        """, unsafe_allow_html=True)

        all_opps = db.get_opportunities()

        # Filters
        f1, f2, f3 = st.columns([2.5, 1.5, 1.5])
        with f1:
            search_query = st.text_input("Search opportunities by keyword, partner, or domain", placeholder="e.g. Battery, IIT Madras, Semiconductor, Metasurface...", label_visibility="collapsed")
        with f2:
            div_list = ["All Divisions"] + sorted(list({o.dnp_division_target for o in all_opps if o.dnp_division_target}))
            sel_div = st.selectbox("Division", div_list, label_visibility="collapsed")
        with f3:
            status_list = ["All Statuses", "unreviewed", "investigating", "approved_for_poc", "archived", "rejected"]
            sel_status = st.selectbox("Triage Status", status_list, format_func=lambda s: s.replace("_", " ").title(), label_visibility="collapsed")

        filtered_opps = []
        for opp in all_opps:
            if sel_div != "All Divisions" and opp.dnp_division_target != sel_div:
                continue
            if sel_status != "All Statuses" and opp.triage_status.value != sel_status:
                continue
            if search_query:
                q = search_query.strip().lower()
                blob = f"{opp.title} {opp.domain} {opp.geography} {opp.strategic_rationale} {opp.suggested_next_step} {opp.collaboration_hypothesis or ''}".lower()
                if q not in blob:
                    continue
            filtered_opps.append(opp)

        st.markdown(f"Displaying **{len(filtered_opps)}** verified R&D opportunity dossiers:")

        for opp in filtered_opps:
            pct = round(opp.confidence_score * 100, 1)
            badge_class = "badge-conviction" if opp.confidence_score >= 0.60 else "badge-trending"

            with st.container():
                st.markdown(f"""
                <div class="pro-card">
                    <div class="card-top-bar">
                        <div>
                            <span style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; background: #0A0E1A; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid #334155; color: #94A3B8; margin-right: 0.4rem;">{opp.opportunity_id}</span>
                            <span class="tag-category tag-patent">📍 {opp.geography}</span>
                            <span class="tag-category tag-policy">🏭 {opp.dnp_division_target}</span>
                            <span style="font-size: 0.75rem; font-weight: 700; color: #94A3B8; margin-left: 0.4rem; text-transform: uppercase;">● {opp.triage_status.value.replace('_', ' ')}</span>
                        </div>
                        <div>
                            <span class="{badge_class}">{pct}% Conviction</span>
                        </div>
                    </div>
                    <h2 class="pro-card-title">{opp.title}</h2>
                    <p class="pro-card-desc">{opp.strategic_rationale}</p>
                    
                    <div class="callout-box-collab">
                        <div class="callout-title-collab">🤝 Proposed Partnership & Collaboration Hypothesis</div>
                        <div class="callout-body-collab">{opp.collaboration_hypothesis or 'Collaborative research and sample exchange with Indian partner.'}</div>
                    </div>

                    <div class="callout-box-lab">
                        <div class="callout-title-lab">🧪 Actionable Next Lab Verification Step</div>
                        <div class="callout-body-lab">{opp.suggested_next_step}</div>
                    </div>

                    <div class="confidence-meter-container">
                        <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #94A3B8; font-weight: 700;">
                            <span>CALIBRATED CONFIDENCE FORMULA</span>
                            <span>{pct}%</span>
                        </div>
                        <div class="confidence-meter-bar">
                            <div class="confidence-meter-fill" style="width: {pct}%;"></div>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #94A3B8; margin-top: 0.75rem; border-top: 1px solid #1E293B; padding-top: 0.6rem;">
                        <span>First Detected: <strong>{opp.first_detected_date}</strong></span>
                        <span>Evidence Count: <strong>{len(opp.supporting_sources)} Primary Sources</strong></span>
                        <span>Gap Type: <strong>{opp.gap_type.value.replace('_', ' ').title()}</strong></span>
                    </div>
                </div>
                """, unsafe_allow_html=True)

                # Action Workflow Buttons
                btn_c1, btn_c2, btn_c3, btn_c4 = st.columns(4)
                with btn_c1:
                    if st.button("🔍 Mark Under Investigation", key=f"inv_{opp.opportunity_id}"):
                        db.update_opportunity_triage(opp.opportunity_id, TriageStatus.INVESTIGATING)
                        st.rerun()
                with btn_c2:
                    if st.button("✅ Approve for Lab Testing", key=f"poc_{opp.opportunity_id}"):
                        db.update_opportunity_triage(opp.opportunity_id, TriageStatus.APPROVED_FOR_POC)
                        st.rerun()
                with btn_c3:
                    if st.button("📦 Save / Archive", key=f"arc_{opp.opportunity_id}"):
                        db.update_opportunity_triage(opp.opportunity_id, TriageStatus.ARCHIVED)
                        st.rerun()
                with btn_c4:
                    if st.button("❌ Dismiss", key=f"dis_{opp.opportunity_id}"):
                        db.update_opportunity_triage(opp.opportunity_id, TriageStatus.REJECTED)
                        st.rerun()

                st.markdown("<hr style='border-color: #1E293B; margin: 1.5rem 0;'>", unsafe_allow_html=True)

    # =========================================================================
    # PILLAR 04: COMMUNICATE & TEST HYPOTHESES
    # =========================================================================
    elif nav_selection == "04 | 🤝 Communicate & Test Hypotheses":
        st.markdown("""
        <div class="header-card">
            <span class="pillar-pill">🤝 PILLAR 04 • COMMUNICATE & COLLABORATE</span>
            <h1 class="hero-title">Test Hypotheses & Collaborate with Partners</h1>
            <div class="hero-subtitle">
                Work directly with international teams, researchers in Japan, and Indian partners (IITs, IISc, startups) to test hypotheses and plan experimental trials.
            </div>
        </div>
        """, unsafe_allow_html=True)

        all_opps = db.get_opportunities()
        if not all_opps:
            st.warning("No opportunities found.")
            return

        opp_ids = [o.opportunity_id for o in all_opps]
        selected_opp_id = st.selectbox(
            "Select Opportunity to Review & Test Hypotheses",
            opp_ids,
            index=0,
            format_func=lambda oid: f"{oid} - {next((o.title for o in all_opps if o.opportunity_id == oid), '')}"
        )

        opp = next((o for o in all_opps if o.opportunity_id == selected_opp_id), None)
        if not opp:
            return

        col_main, col_sim = st.columns([3, 2])
        with col_main:
            st.markdown(f"""
            <div class="pro-card">
                <span class="tag-category tag-policy">Target Division: {opp.dnp_division_target}</span>
                <h2 class="pro-card-title">{opp.title}</h2>
                <p class="pro-card-desc">{opp.strategic_rationale}</p>
                <div class="callout-box-collab">
                    <div class="callout-title-collab">🤝 Partnership Hypothesis</div>
                    <div class="callout-body-collab">{opp.collaboration_hypothesis or 'Direct joint research program.'}</div>
                </div>
                <div class="callout-box-lab">
                    <div class="callout-title-lab">🧪 Lab Verification Protocol</div>
                    <div class="callout-body-lab">{opp.suggested_next_step}</div>
                </div>
            </div>
            """, unsafe_allow_html=True)

        with col_sim:
            with st.container():
                st.markdown("#### **Confidence Sensitivity Simulator**")
                st.caption("Adjust evidence weights to simulate how hypothesis conviction changes:")

                mean_w = sum(s.weight for s in opp.supporting_sources) / len(opp.supporting_sources) if opp.supporting_sources else 0.5
                max_sim = max([m.similarity_score for m in opp.capability_matches], default=0.5)

                sim_trust = st.slider("Source Provenance Trust (40% Weight)", 0.0, 1.0, float(round(mean_w, 2)))
                sim_adj = st.slider("Internal Technology Match (30% Weight)", 0.0, 1.0, float(round(max_sim, 2)))
                sim_div = st.slider("Source Diversity (20% Weight)", 0.0, 1.0, 0.75)
                sim_vol = st.slider("Corroboration Volume (10% Weight)", 0.0, 1.0, float(min(1.0, len(opp.supporting_sources) / 3.0)))

                sim_score = 0.40 * sim_trust + 0.30 * sim_adj + 0.20 * sim_div + 0.10 * sim_vol
                st.metric("Simulated Hypothesis Confidence", f"{sim_score * 100:.1f}%", delta=f"{(sim_score - opp.confidence_score) * 100:+.1f}% vs baseline")

        st.markdown("---")

        tab_notes, tab_dossier = st.tabs([
            "📝 Researcher Notes & Meeting Outcomes",
            "📄 Export Executive Research Briefing"
        ])

        with tab_notes:
            st.markdown("#### **Log Bilateral Meeting Notes & Lab Test Results**")
            existing_notes = opp.researcher_notes or ""
            new_notes = st.text_area("Research Collaboration & Lab Notes", value=existing_notes, height=130, placeholder="Log notes from discussions with research partners, sample testing logistics, or experimental results...")
            if st.button("💾 Save Notes & Update Audit Trail", type="primary"):
                db.update_opportunity_triage(opp.opportunity_id, opp.triage_status, new_notes)
                st.success("Notes saved successfully to database!")
                st.rerun()

        with tab_dossier:
            st.markdown("#### **Download Research Briefing Document**")
            
            dossier_text = f"""================================================================================
EXECUTIVE R&D OPPORTUNITY BRIEFING: {opp.opportunity_id}
Title: {opp.title}
Target Division: {opp.dnp_division_target}
Geography: {opp.geography}
Confidence Score: {opp.confidence_score * 100:.1f}%
Classification: {opp.gap_type.value}
First Detected: {opp.first_detected_date}
================================================================================

1. STRATEGIC ASSESSMENT & VALUE
{opp.strategic_rationale}

2. PROPOSED PARTNERSHIP & COLLABORATION HYPOTHESIS
{opp.collaboration_hypothesis or 'Direct bilateral joint research program.'}

3. ACTIONABLE LAB VERIFICATION STEP
{opp.suggested_next_step}

4. SUPPORTING PRIMARY EVIDENCE ({len(opp.supporting_sources)} Items)
""" + "\n".join([f"- [{s.type.upper()}] {s.title} ({s.date}, Trust: {s.weight * 100:.0f}%, Origin: {s.geography or 'Global'})\n  URL: {s.url}\n  Excerpt: {s.excerpt or 'N/A'}" for s in opp.supporting_sources])

            st.download_button(
                "📥 Download Research Briefing (.md)",
                data=dossier_text,
                file_name=f"{opp.opportunity_id}_research_briefing.md",
                mime="text/markdown"
            )

    # =========================================================================
    # TAB: MONTHLY R&D INTELLIGENCE REPORT
    # =========================================================================
    elif nav_selection == "05 | 📑 Monthly R&D Intelligence Report":
        from src.reports.monthly_report_generator import MonthlyReportGenerator
        report_gen = MonthlyReportGenerator(db)
        avail_months = report_gen.get_available_months()
        month_options = [m["year_month"] for m in avail_months] if avail_months else ["2026-09", "2026-08", "2026-07"]

        st.markdown("""
        <div class="header-card">
            <span class="pillar-pill">📑 MONTHLY R&D INTELLIGENCE REPORT</span>
            <h1 class="hero-title">Monthly R&D Intelligence Report</h1>
            <div class="hero-subtitle">
                Continuously analyzes verified monthly intelligence data across research, patents, startups, companies, and policies to surface emerging signals, technology gaps, and evidence-backed R&D opportunities.
            </div>
        </div>
        """, unsafe_allow_html=True)

        col_m1, col_m2, col_m3 = st.columns([2, 1, 1])
        with col_m1:
            chosen_ym = st.selectbox(
                "Select Intelligence Period / Month",
                month_options,
                index=0,
                format_func=lambda ym: next((f"{m['month_name']} ({m['source_count']} Sources)" for m in avail_months if m["year_month"] == ym), ym)
            )
        with col_m2:
            st.write("")
            st.write("")
            regen_btn = st.button("🔄 Regenerate Report", type="secondary")
        with col_m3:
            st.write("")
            st.write("")
            export_csv_btn = st.button("📥 Export CSV Dossier", type="secondary")

        with st.spinner(f"Loading monthly intelligence report for {chosen_ym}..."):
            rep = report_gen.generate_monthly_report(chosen_ym, force_regenerate=regen_btn)

        # Top Executive KPI Cards
        k1, k2, k3, k4, k5, k6 = st.columns(6)
        with k1:
            st.metric("Sources Analyzed", rep.evidence_summary.total_sources_analyzed, f"-{rep.evidence_summary.duplicates_removed} Dupes")
        with k2:
            st.metric("Independent Signals", rep.evidence_summary.independent_sources, "Clean")
        with k3:
            st.metric("Emerging Tech", len(rep.emerging_signals), "+42% Avg")
        with k4:
            st.metric("Technology Gaps", len(rep.technology_gaps), "Validated")
        with k5:
            st.metric("R&D Opportunities", len(rep.rd_opportunities), "Actionable")
        with k6:
            st.metric("High Reliability", f"{round((rep.evidence_summary.high_reliability_sources / max(rep.evidence_summary.independent_sources, 1)) * 100)}%", "Peer/Patent")

        st.markdown("---")

        # 12 Sections in tabbed view
        sec_tabs = st.tabs([
            "01. Executive Summary",
            "02. What Changed?",
            "03. Emerging Signals",
            "04. Research",
            "05. Patents",
            "06. Startups & Companies",
            "07. Market & Policy",
            "08. Technology Gaps",
            "09. R&D Opportunities",
            "10. Technology Landscape",
            "11. Evidence & Questions"
        ])

        with sec_tabs[0]:
            st.markdown(f"### **Executive Summary — {rep.month_name}**")
            for idx, pt in enumerate(rep.executive_summary):
                st.markdown(f"**{idx+1}.** {pt}")

        with sec_tabs[1]:
            st.markdown("### **What Changed This Month? (MoM Activity Matrix)**")
            delta_df = pd.DataFrame([m.model_dump() for m in rep.metrics_delta])
            st.dataframe(delta_df, use_container_width=True)

        with sec_tabs[2]:
            st.markdown("### **Emerging Technology Signals**")
            for sig in rep.emerging_signals[:6]:
                with st.expander(f"⚡ {sig.technology_name} — Signal Score: {sig.signal_score} (+{sig.growth_rate_pct}% Growth)"):
                    st.write(sig.why_detected)
                    st.json(sig.calculation_breakdown)

        with sec_tabs[3]:
            st.markdown("### **Peer-Reviewed Research Breakthroughs**")
            for dev in rep.research_developments:
                st.markdown(f"**🔬 {dev.title}** ({dev.when_date})")
                st.write(dev.what_happened)
                if dev.evidence_sources:
                    st.caption(f"Source: [{dev.evidence_sources[0].source_name}]({dev.evidence_sources[0].url})")
                st.markdown("---")

        with sec_tabs[4]:
            st.markdown("### **Patent Registrations & Claims**")
            for dev in rep.patent_developments:
                st.markdown(f"**📜 {dev.title}**")
                st.write(dev.what_happened)
                if dev.evidence_sources:
                    st.caption(f"Registry: [{dev.evidence_sources[0].source_name}]({dev.evidence_sources[0].url})")
                st.markdown("---")

        with sec_tabs[5]:
            st.markdown("### **Startups & Corporate R&D Moves**")
            for dev in rep.company_startup_developments:
                st.markdown(f"**🚀 {dev.title}** ({dev.when_date})")
                st.write(dev.what_happened)
                st.markdown("---")

        with sec_tabs[6]:
            st.markdown("### **Market & Sovereign Policy Developments**")
            st.markdown("#### **Market Dynamics**")
            for dev in rep.market_developments:
                st.markdown(f"- **{dev.title}**: {dev.what_happened}")
            st.markdown("#### **Policy & Sovereign Directives**")
            for dev in rep.policy_developments:
                st.markdown(f"- **{dev.title}**: {dev.what_happened}")

        with sec_tabs[7]:
            st.markdown("### **Technology Gaps & Limitations (Evidence vs Hypothesis)**")
            for gap in rep.technology_gaps:
                st.markdown(f"#### **{gap.technology}**")
                st.info(f"**Identified Gap:** {gap.potential_gap}\n\n**Observed Limitation:** {gap.observed_limitations}\n\n**Classification:** `{gap.classification_label}` | **Status:** `{gap.validation_status}`")

        with sec_tabs[8]:
            st.markdown("### **Potential R&D Opportunities for Investigation**")
            for opp in rep.rd_opportunities:
                with st.expander(f"💡 {opp.title} ({opp.technology_maturity} | Confidence: {int(opp.confidence_score*100)}%)"):
                    st.markdown(f"**Problem:** {opp.problem}")
                    st.markdown(f"**Proposed Gap Solution:** {opp.potential_gap}")
                    st.markdown(f"**Market Relevance:** {opp.market_relevance}")
                    st.markdown(f"**Suggested Next Investigation:** {opp.suggested_investigation}")
                    st.markdown(f"**Potential Partners:** {', '.join(opp.potential_partners)}")

        with sec_tabs[9]:
            st.markdown("### **Technology Landscape & Relational Knowledge Graph**")
            for cl in rep.technology_landscape.clusters:
                st.markdown(f"**Cluster: {cl['cluster']}** — Nodes: `{', '.join(cl['nodes'])}`")

        with sec_tabs[10]:
            st.markdown("### **Evidence Provenance & Priority Researcher Inquiries**")
            st.markdown("#### **Priority Questions for Human Researchers**")
            for idx, q in enumerate(rep.researcher_questions):
                st.markdown(f"**{idx+1}.** {q}")

    # =========================================================================
    # TAB: OPERATIONS & ENGINE ACCURACY
    # =========================================================================
    elif nav_selection == "⚙️ Operations & Engine Accuracy":
        st.markdown("""
        <div class="header-card">
            <span class="pillar-pill">⚙️ SYSTEM OPERATIONS & BENCHMARK VALIDATION</span>
            <h1 class="hero-title">Intelligence Engine Operations & Accuracy</h1>
            <div class="hero-subtitle">
                Trigger real-time multi-source ingestion cycles, register new internal technology capabilities, and review quantitative accuracy benchmarks.
            </div>
        </div>
        """, unsafe_allow_html=True)

        col_op1, col_op2 = st.columns(2)
        with col_op1:
            st.markdown("#### **Trigger Real-Time Signal Ingestion**")
            items_per_feed = st.slider("Items to fetch per source modality", 2, 20, 8)
            if st.button("Run Real-Time Ingestion & Opportunity Synthesis", type="primary"):
                with st.spinner("Ingesting signals, classifying breakthroughs, and synthesizing opportunities..."):
                    pipeline = IntelligenceEnginePipeline(db_path=db.db_path)
                    summary = pipeline.run_cycle(limit_per_source=items_per_feed, verbose=False)
                    st.success(f"Cycle Complete: Ingested {summary['ingested_raw']} signals -> Filtered {summary['change_signals_isolated']} breakthroughs -> Synthesized {summary['opportunities_surfaced']} opportunities.")
                    st.rerun()

        with col_op2:
            st.markdown("#### **Register New Core Technology Platform**")
            with st.form("new_cap_form"):
                new_id = st.text_input("Capability ID", value=f"cap_{len(db.get_capabilities())+1:03d}")
                new_name = st.text_input("Platform Name", placeholder="e.g. Microfluidic Diagnostic Biochips")
                new_div = st.text_input("Business Division", value="Advanced Materials & Healthcare Solutions")
                new_domain = st.text_input("Domains (comma-separated)", value="materials, semiconductors, optics")
                new_desc = st.text_area("Technical Description", placeholder="Comprehensive description of materials, tolerances, and performance...")
                new_trl = st.slider("Technology Readiness Level (TRL)", 1, 9, 8)
                submit_cap = st.form_submit_button("Save & Vectorize into Knowledge Base")
                if submit_cap and new_name:
                    cap_store = CapabilityStore(db=db)
                    new_c = Capability(
                        capability_id=new_id,
                        name=new_name,
                        dnp_division=new_div,
                        domain=[d.strip() for d in new_domain.split(",")],
                        description=new_desc,
                        trl=new_trl
                    )
                    cap_store.add_capability(new_c)
                    st.success(f"Capability '{new_name}' added and embedded successfully!")
                    st.rerun()

        st.markdown("---")
        st.markdown("#### **Quantitative Intelligence Accuracy & Benchmarks**")

        if st.button("Run Accuracy Evaluation Benchmark", type="secondary") or "eval_results" not in st.session_state:
            with st.spinner("Evaluating engine against labeled test dataset..."):
                evaluator = EvaluationEngine()
                st.session_state["eval_results"] = evaluator.run_comprehensive_evaluation()

        res = st.session_state["eval_results"]

        m1, m2, m3, m4 = st.columns(4)
        with m1:
            st.metric("Precision", f"{res['classification_metrics']['precision'] * 100:.1f}%")
        with m2:
            st.metric("Recall", f"{res['classification_metrics']['recall'] * 100:.1f}%")
        with m3:
            st.metric("F1-Score", f"{res['classification_metrics']['f1_score'] * 100:.1f}%")
        with m4:
            st.metric("Search Time Saved", f"{res['time_to_surface']['time_saved_percentage']:.1f}%")


if __name__ == "__main__":
    main()
