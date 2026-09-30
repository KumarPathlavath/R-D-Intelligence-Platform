# ⚡ TechIntel Hub — Frontend User Guide & Architecture

> **Simple Summary:** This application is an **AI-powered Technology Scouting & R&D Decision Platform** inspired by the high-end glassmorphic interface at [frame-true-match.lovable.app](https://frame-true-match.lovable.app). It continuously searches the newest research papers, patent filings, startups, and government policies in India and globally, separates genuine scientific breakthroughs from marketing noise, and tells researchers **who to partner with** and **what lab test to run next**.

---

## 🎨 Frontend Implementations Available

The platform now provides **two frontend interfaces**:

1. **⚡ Modern React + Vite + Tailwind Frontend (`frontend/`)**:
   - Exact implementation of the [frame-true-match.lovable.app](https://frame-true-match.lovable.app) glassmorphic design system.
   - Built with React 18, Vite, TypeScript, TailwindCSS, Lucide Icons, and OKLCH / modern sky blue color tokens.
   - Includes real-time search, sorting, filtering, conic trust gauges, sensitivity simulator sliders, markdown briefing download, CSV export, and live API synchronization.

2. **📊 Streamlit Decision Dashboard (`src/dashboard/app.py`)**:
   - Python-native Streamlit dashboard mirroring the same 4-pillar workflow and metrics.

---

## 📖 Table of Contents
1. [The 4 Main Pillars & Screens](#the-4-main-pillars--screens)
   - [Pillar 01: Explore & Early Signals](#pillar-01-explore--early-signals)
   - [Pillar 02: Structured Intelligence & What's New](#pillar-02-structured-intelligence--whats-new)
   - [Pillar 03: Information Connection & Opportunities](#pillar-03-information-connection--opportunities)
   - [Pillar 04: Communicate & Test Hypotheses](#pillar-04-communicate--test-hypotheses)
   - [Screen 05: Operations & Engine Accuracy](#screen-05-operations--engine-accuracy)
2. [Visual Badges & Design Tokens](#visual-badges--design-tokens)
3. [How to Run the Application Locally](#how-to-run-the-application-locally)
4. [Project Directory & File Structure](#project-directory--file-structure)

---

## The 4 Main Pillars & Screens

### 🔭 Pillar 01: Explore & Early Signals (`/#/explore`)
* **What you see:** Continuous scan of Indian and global research, patents, policy and deep-tech funding. Every card carries a verified date, linked origin, and conic source trust gauge.
* **Key Features:**
  - **Live Search & Filter:** Instant search by keywords, materials, institutions, and geography pills (`All`, `India`, `Global`, `Japan`).
  - **Conic Trust Gauges:** Visual ring indicator representing mathematical source credibility (100% Peer-Reviewed, 90% Patents, 85% Policy, 65% Startups, 40% News).
  - **Quick Claim Verifier:** Interactive evaluator to test any research abstract or claim on the fly.

---

### 📊 Pillar 02: Structured Intelligence & What's New (`/#/intelligence`)
* **What you see:** Comparative analysis of **Prior Baseline** vs **New Breakthrough (Novelty)**, plus an exportable structured signal catalog.
* **Key Features:**
  - **Baseline vs Novelty Cards:** Side-by-side technical specs with animated transformation arrows.
  - **Structured Signal Catalog Table:** Sortable by Signal, Domain, Geo, Date, and $\Delta$ vs Baseline (+41%, +32%, etc.).
  - **One-Click CSV Export:** Export clean tabular intelligence directly to `techintel-structured-signals.csv`.

---

### ⚡ Pillar 03: Information Connection & Opportunities (`/#/opportunities`)
* **What you see:** High-conviction **R&D Opportunity Dossiers** connecting external discoveries to internal technology capabilities.
* **Key Features:**
  - **Strategic Assessment:** Clear rationale explaining the value proposition.
  - **🤝 Proposed Partnership:** Identifies who to collaborate with (e.g., *IISc Bengaluru Power Electronics Group*, *IIT Madras*, *Log9 Materials*).
  - **🧪 Actionable Lab Test:** Specific next experiment to verify feasibility with falsifiable metrics and timeframes.
  - **Calibrated Confidence Meter:** Progress bar displaying calculated conviction percentage.
  - **Triage Action Pipeline:** Move opportunities through `Investigate`, `Approve for Lab Test`, `Archive`, or `Dismiss`.

---

### 🤝 Pillar 04: Communicate & Test Hypotheses (`/#/communicate`)
* **What you see:** Collaboration workbench to simulate confidence sensitivities, record researcher notes, and export executive briefings.
* **Key Features:**
  - **Confidence Sensitivity Simulator:** 3 interactive range sliders (`Source Trust [45%]`, `Technical Match [35%]`, `Evidence Diversity [20%]`) with real-time simulated confidence score updates and qualitative guidance.
  - **Researcher Notes Log:** Persistent log to save meeting notes, sample status, and lab test results.
  - **Download Executive Briefing:** One-click download of a formatted Markdown report (`techintel-briefing.md`) ready to present to leadership.

---

### ⚙️ Screen 05: Operations & Engine Accuracy (`/#/operations`)
* **What you see:** System controls, capability database management, and quantitative AI accuracy metrics.
* **Key Features:**
  - **4 KPI Metric Cards:** Signals ingested (30d), Precision (0.91), F1 Score (0.87), Early-warning lead time (23 d) with trend indicators.
  - **Run Live Update:** 1-click button to trigger real-time signal collection and synthesis cycle.
  - **Register a Capability Form:** Dynamically add internal platforms, TRL ratings, and domain tags to the SQLite database.
  - **Accuracy Benchmark Report:** 100% Precision, 85.7% F1-score, 54.5 Days lead-time advantage.

---

## Visual Badges & Design Tokens

| Badge / Element | Color / Token | Trust Weight | Meaning / Example |
| :--- | :--- | :---: | :--- |
| **`PEER REVIEWED`** | Emerald Green (`#10b981`) | **100%** | Nature, IEEE, Journal of Power Sources, IIT Madras |
| **`PATENT`** | Royal Blue (`#3b82f6`) | **90%** | Indian Patent Office (IPO), USPTO, JPO |
| **`POLICY DIRECTIVE`** | Sovereign Purple (`#8b5cf6`) | **85%** | MeitY India Semiconductor Mission, PLI Schemes |
| **`STARTUP & VC`** | Amber Orange (`#f59e0b`) | **65%** | Series A/B Funding, Cap Table Filings |
| **`NEWS`** | Slate Grey (`#94a3b8`) | **40%** | Industry Press, Tech Media (Requires Corroboration) |
| **`NOVELTY INFLECTION`** | Gradient Pill | — | Identifies high-momentum technical breakthroughs |
| **🤝 Proposed Partnership** | Emerald Box (`bg-success/10`) | — | Academic or startup collaboration model |
| **🧪 Actionable Lab Test** | Purple Box (`bg-policy/10`) | — | Concrete, falsifiable next lab test step |

---

## How to Run the Application Locally

### Option 1: Full-Stack React Web App (Recommended)

```bash
# 1. Start the backend API + React static server (Single Command)
./start.sh

# Or run directly:
python3 src/api_server.py 8000

# Open in browser: http://localhost:8000
```

### Option 2: React Development Mode (with Hot Reload)

```bash
# In terminal 1 (Backend API):
python3 src/api_server.py 8000

# In terminal 2 (Vite React Frontend):
cd frontend
npm run dev

# Open in browser: http://localhost:5173
```

### Option 3: Streamlit Dashboard

```bash
streamlit run src/dashboard/app.py --server.port 8501

# Open in browser: http://localhost:8501
```

---

## Project Directory & File Structure

```text
├── frontend/                     # Modern React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/           # GlassCard, Header, SourceBadge, TrustGauge, Button, Layout
│   │   ├── pages/                # ExplorePage, IntelligencePage, OpportunitiesPage, CommunicatePage, OperationsPage
│   │   ├── services/             # api.ts (REST API client with fallback)
│   │   ├── types/                # TypeScript domain models
│   │   ├── data/                 # mockData.ts (Seed signals, baselines, opportunities)
│   │   ├── index.css             # Glassmorphism design tokens & styles
│   │   ├── App.tsx               # Hash-based router & layout wrapper
│   │   └── main.tsx              # React DOM mounting
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── src/
│   ├── api_server.py             # Multithreaded REST API server & static host
│   ├── dashboard/app.py          # Streamlit dashboard interface
│   ├── models.py                 # Pydantic domain models
│   ├── storage/database.py       # SQLite persistence layer
│   ├── pipeline.py               # End-to-end intelligence cycle orchestrator
│   ├── ingestion/                # Multi-source fetchers (Papers, Patents, Policy, VC)
│   ├── detection/                # Embeddings, deduplication, signal classifier
│   ├── capability/               # Internal capability store
│   └── synthesis/                # Opportunity synthesis & calibrated scoring
├── data/                         # SQLite database storage (intelligence_engine.db)
├── config/                       # Seed capabilities configuration
├── start.sh                      # One-click startup script
└── package.json                  # Root npm scripts
```
