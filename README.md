# Revenue Intelligence Inbox

A professional sales operations workspace and revenue intelligence inbox built for sales managers. Grounded strictly in supplied call and calendar meeting data, the application eliminates AI hallucinations, enforces deterministic record identity `(source_type, source_id)`, supports evidence-backed multi-routing, preserves manual manager decisions across updates and restarts, and produces physical machine-readable exports and manifests.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Capabilities & Features](#key-capabilities--features)
3. [Tech Stack & Architecture](#tech-stack--architecture)
4. [Environment Setup & Installation](#environment-setup--installation)
5. [How to Run the Application](#how-to-run-the-application)
6. [Data Replay & Demonstration Guide](#data-replay--demonstration-guide)
7. [Three-Minute Demo Checklist](#three-minute-demo-checklist)
8. [Three Most Important Findings](#three-most-important-findings)
9. [One Deliberately Rejected Decision](#one-deliberately-rejected-decision)
10. [Metric Definitions & Denominators](#metric-definitions--denominators)
11. [AI Behavior, Schema & Resilience](#ai-behavior-schema--resilience)
12. [Exports & Manifest Structure](#exports--manifest-structure)
13. [Five Presentation Slides](#five-presentation-slides)
14. [Development Time & Known Limitations](#development-time--known-limitations)

---

## 1. Project Overview

Modern revenue intelligence tools often suffer from speculative AI behavior: inventing deal amounts, assuming closed-won probabilities from casual remarks, or ranking reps without authoritative CRM data.

**Revenue Intelligence Inbox** solves this problem by adhering strictly to verifiable source evidence:
- **Zero Hallucinated Numbers:** Never invents pipeline currency values, company hierarchies, or deal outcomes not explicitly established in audio transcripts.
- **Identity Invariance:** Treats `(source_type, source_id)` as the immutable logical key. Repeated imports never create duplicate records.
- **Revision Preservation:** Preserves manual manager route decisions across late transcript deliveries (e.g. Meeting M07) and application restarts.
- **Synchronized Evidence Scrolling:** The two-column detail view pairs identifiable verbatim speaker turns with analytical conclusions. Clicking `[View Evidence]` instantly scrolls to and highlights the supporting passage.
- **Physical Manifest Exports:** Exports organized conversation directories, route files, and JSON/CSV manifests to `exports/` with ZIP archive generation.

---

## 2. Key Capabilities & Features

### A. Operations Dashboard
- Live calculated metrics from database records: Total Records (44), Calls (30), Meetings (14), Usable Transcripts (17 initially, 18 post-update).
- Transparent transcript coverage with explicit numerator and denominator (`18/44 = 40.9%`).
- Source-reported connection rate (`11/30 = 36.7%`) explicitly annotated as an upstream metadata flag.
- Interactive Recharts visualizations: Activity by Person, Hourly Volume clusters on 21 August 2026, and Routing Breakdown.
- Direct click-through filtering: Clicking "Needs Review: 2" immediately navigates to filtered inbox records.

### B. Conversation Inbox
- Searchable by reference (e.g., `M07`, `C01`), rep name, source ID, or assigned route.
- Multi-dimensional filters: Person, Source Type (Calls/Meetings), Routing Taxonomy, Review State, and Transcript Availability.
- Clean visual tags distinguishing AI suggested routes from Manual Manager Overrides.

### C. Two-Column Conversation Detail
- **Left Column:** Verbatim transcript viewer with identifiable speaker turns (`Turn 1`, `Turn 2`, ...) and timecodes.
- **Right Column:** Structured intelligence panel displaying:
  1. What happened
  2. Why it matters
  3. Supporting evidence quotes with `[View Evidence]` scroll buttons
  4. What the evidence does NOT establish (anti-hallucination guardrail)
  5. Recommended next actions with verified owners
  6. AI recommendation vs Manager Decision routing editor
  7. Audit trail of manual overrides

### D. Executive Manager Brief (21 August 2026, Asia/Kolkata)
- Executive synthesis of the 18 verified conversations.
- High-impact accounts (M07 UI defect, M02 multi-entity invoicing, M04 POS decline friction).
- Sales coaching observations (telephony profile discrepancy on C06, competitor handling on C01).
- Prioritized follow-up checklist with assigned owners.

### E. Import & Export Control Panel
- Interactive controls for initial batch import, duplicate replay testing, update batch import, database reset, and instant CSV/ZIP exports.
- Live execution summary card (Processed, Created, Updated, Duplicates Prevented).
- Audit log of all historical import runs.

### F. Physical Exports & Manifest
- Generates `exports/manifest.json`, `exports/manifest.csv`, `exports/manager_brief.json`, `exports/manager_brief.md`.
- Subdirectories: `exports/conversations/<id>/` (analysis, transcript, metadata) and `exports/routes/<route>/`.
- Bundled into `exports/revenue_intelligence_export.zip` available via single-click download.

---

## 3. Tech Stack & Architecture

```
[ Frontend: React 18 + Vite + TypeScript + Tailwind CSS + Lucide + Recharts ]
                                   │  HTTP REST (JSON)
                                   ▼
[ Backend: Python 3.11 + FastAPI + Pydantic v2 + SQLAlchemy 2.0 ]
         │                                       │
         ▼                                       ▼
[ SQLite Database: revenue_inbox.db ]   [ Google Gemini 1.5 Flash API ]
         │
         ▼
[ File System: data/ & exports/ ]
```

- **Frontend:** React 18, Vite 5, TypeScript 5, Tailwind CSS 3, Recharts, Lucide React icons.
- **Backend:** Python 3.11, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic 2, HTTPX.
- **Database:** SQLite (with WAL mode and composite unique constraint on `(source_type, source_id)`).
- **AI Integration:** Google Gemini 1.5 Flash via REST API with strict JSON schema and offline fallback resilience.
- **Data Storage:** Raw delivery envelopes in `data/`, structured outputs in `exports/`.

---

## 4. Environment Setup & Installation

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm 9+

### Environment Configuration (.env)
The Gemini API key is loaded strictly from environment variables.
Create `backend/.env` (or copy from `.env.example`):
```bash
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```
> **Security Notice:** `.env` is included in `.gitignore`. The API key is never exposed to the React client; all Gemini calls originate from the FastAPI backend.

---

## 5. How to Run the Application

### Option A: One-Click Launch (Windows)
Double-click `run_all.bat` in the project root. This launches both the FastAPI backend (Port 8000) and the Vite frontend (Port 5173).

### Option B: Manual Terminal Execution

#### 1. Start Backend Server
```bash
# From workspace root
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API Docs will be available at:* `http://127.0.0.1:8000/docs`

#### 2. Start Frontend Dev Server
```bash
# In a new terminal from workspace root
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
*Frontend Application will be available at:* `http://127.0.0.1:5173`

### Option C: Deploy to Vercel (One-Click Cloud Deployment)

The project includes built-in Vercel configuration (`vercel.json`, `api/index.py`, and root `package.json`):

1. **Import Project into Vercel:**
   - Log into [Vercel](https://vercel.com) and click **"Add New Project"** -> **"Import Git Repository"**.
   - Select `AAKAASHSM/Revenue-Intelligence-Inbox`.
2. **Configure Settings:**
   - **Framework Preset:** Vite (or Other / Default)
   - **Root Directory:** `./` (Default)
   - Build and output settings are automatically managed by `vercel.json` (`cd frontend && npm install && npm run build` -> `frontend/dist`).
3. **Environment Variables:**
   - Add `GEMINI_API_KEY`: `your_gemini_api_key_here` (optional: `GEMINI_MODEL=gemini-1.5-flash`).
4. **Deploy:**
   - Click **Deploy**. Vercel deploys the Vite frontend as edge static files and the FastAPI backend as a Python serverless function at `/api`.

---

## 6. Data Replay & Demonstration Guide

To demonstrate the full assignment test specification, navigate to the **Import & Replay** screen in the web app or execute via API:

| Step | Action | Expected Application Behavior |
|:---|:---|:---|
| **1. Clean State** | Click `[Reset Database]` | Database tables cleared. |
| **2. Initial Import** | Click `[Import Initial Batch]` | 44 logical records created (30 calls, 14 meetings). 17 transcripts available. Coverage: 38.6%. |
| **3. Duplicate Test** | Click `[Import Initial Batch Again]` | 0 records created, 44 duplicates prevented. Total records remains 44. |
| **4. Manual Override** | Open Inbox -> `M07` -> Select `deal_next_steps` -> Click `[Save Correction]` | Manual decision recorded and displayed with audit badge. |
| **5. Update Batch** | Click `[Import Update Batch]` | `02_update.json` applied to M07. Revision increments to 2. 27 turns loaded. Transcript becomes available. Usable transcripts increases to 18 (40.9%). Total records remains 44 (not 45). Manual route `deal_next_steps` is preserved! |
| **6. Replay Initial** | Click `[Import Initial Batch Again]` | Older revision 1 for M07 ignored; revision 2 preserved. Duplicates prevented: 44. |
| **7. Persistence Check** | Refresh browser (`F5`) or restart backend | M07 continues to display revision 2, 27 turns, and manual route override. |
| **8. Export Verification** | Click `[Generate Export Files]` -> `[Download ZIP Archive]` | Physical `exports/manifest.json`, `exports/manifest.csv`, conversation folders, and `.zip` generated. |

---

## 7. Three-Minute Demo Checklist

For a clean, convincing 3-minute video recording or evaluation walkthrough:

- [ ] **Minute 0:00 - 0:45: Overview & The Manager Problem**
  - Open `http://127.0.0.1:5173/` on the **Dashboard**.
  - Highlight calculated metrics: 44 Total Records, 30 Calls, 14 Meetings, 17/44 Usable Transcripts with explicit denominator.
  - Explain why speculative revenue forecasting was rejected (avoiding CRM hallucinations).
- [ ] **Minute 0:45 - 1:30: Two-Column Workspace & Difficult Routing Case**
  - Open **Inbox**, search for `M04` (Cedarwave Distribution).
  - Show the two-column layout: Left Transcript Turns vs Right Intelligence Panel.
  - Click `[View Evidence]` on Turn 2 to demonstrate synchronized auto-scroll and highlight.
  - Explain the difficult routing dilemma: Multi-routed to `customer_follow_up`, `sales_coaching`, and `needs_human_review`.
- [ ] **Minute 1:30 - 2:30: Replay Test, Duplicate Prevention & Manual Override**
  - Open `M07` (Willowfield Trust) in initial state: shows "Transcript unavailable" and "Awaiting revision 2".
  - Manually change route to `deal_next_steps` and click `[Save Correction]`.
  - Navigate to **Import & Replay** tab.
  - Click `[Import Initial Batch Again]` -> Point to summary card: **0 created, 44 duplicates prevented**! Total remains 44.
  - Click `[Import Update Batch]` -> Show M07 updated to Revision 2.
  - Return to M07: Point out that **27 turns are now available**, total records remains **44**, and the **manual route correction survived**!
- [ ] **Minute 2:30 - 3:00: Manager Brief & Physical Export Manifest**
  - Click **Manager Brief** tab: Review executive summary for 21 Aug 2026 Asia/Kolkata, P0 bug escalation, and coaching observations.
  - Navigate to **Import & Replay**, click `[Generate Export Files]` and `[Download ZIP Archive]`. Show physical manifest.json and manifest.csv.

---

## 8. Three Most Important Findings

### Finding 1: Critical UI Defect Reproducibility (M07 - Willowfield Trust)
- **Observation:** In meeting M07, Customer A reported that editing event-payment descriptions fails to persist after clicking save, reverting to earlier wording. The screen-share session verified an active frontend persistence defect.
- **Source Citation:** M07 Turn 2 & Turn 3:
  > *Turn 2:* "The first one is editing the description. I am changing this event-payment description to a short reference."
  > *Turn 3:* "The field still shows the earlier wording. So the change is not appearing after you save, is that right?"
- **Product Impact:** Routed to `internal_vendor_note` and spotlighted in the Manager Brief as a P0 engineering defect with screen-recording reproduction details.

### Finding 2: Multi-Entity Tax Routing & Architectural Alignment (M02 - LedgerBridge)
- **Observation:** Prospect LedgerBridge clarified that their primary integration priority is electronic invoicing rather than corporate card issuance, requiring multi-entity subsidiary tax routing.
- **Source Citation:** M02 Turn 3 & Turn 12:
  > *Turn 3:* "Electronic invoicing is the bigger opportunity. Customers already have approved invoice layouts."
  > *Turn 12:* "We require multi-entity support where invoices can be routed across separate subsidiary tax IDs."
- **Product Impact:** Multi-routed to `deal_next_steps` and `internal_vendor_note` to ensure engineering verifies tax schema support before contract finalization.

### Finding 3: Telephony Account & Spoken Identity Mismatch (C06 - Meera Account)
- **Observation:** The telephony metadata lists rep Meera, but the caller verbally identified himself as *"Good evening. Ravi here. I'll say at the start that this is a cold call."*
- **Source Citation:** C06 verbatim passage:
  > *"Hello? Good evening, Mr Nikhil. Good evening. Ravi here. I'll say at the start that this is a cold call."*
- **Product Impact:** Flagged in `sales_coaching` and marked for manager audit to detect shared telephony logins or incorrect caller profile assignment.

---

## 9. One Deliberately Rejected Decision

- **Alternative Considered:** Building an automated pipeline currency forecasting engine and a salesperson leaderboard ranking reps by call volume and conversion.
- **Reason for Rejection:** The supplied dataset contains zero CRM opportunity objects, no verified deal sizes (ACVs), and no company organizational hierarchy. Calculating pipeline values or conversion rankings would require fabricating numbers unsupported by source evidence.
- **Trade-off Accepted:** Replaced speculative leaderboards with honest conversation-based activity breakdowns, explicit denominators (e.g. 18/44 transcripts, 11/30 connection flags), and clear *"What Evidence Does NOT Establish"* disclosures on every record.

---

## 10. Metric Definitions & Denominators

| Metric Name | Display Format | Definition & Denominator |
|:---|:---|:---|
| **Total Source Records** | `44` | Total unique logical records keyed on `(source_type, source_id)`. |
| **Call Interactions** | `30` | Records where `source_type == 'call'`. |
| **Calendar Meetings** | `14` | Records where `source_type == 'meeting'`. |
| **Usable Transcripts** | `17` -> `18` | Count of records with nonblank call transcript or at least one meeting turn (`len(turns) > 0`). Shifts from 17 to 18 after `02_update.json`. |
| **Transcript Coverage** | `18/44 (40.9%)` | $\frac{\text{Usable Transcripts (18)}}{\text{Total Selected Records (44)}}$. Evaluated independently for Calls ($10/30 = 33.3\%$) and Meetings ($8/14 = 57.1\%$). |
| **Source Connection Rate** | `11/30 (36.7%)` | Calls with stored metadata `is_connected == true` divided by calls with non-null `is_connected` (30). Explicitly designated as an upstream stored flag. |
| **Needs Review** | Count | Conversations requiring manager attention (new source revision arrived, ambiguous routing, or defect escalation). |

---

## 11. AI Behavior, Schema & Resilience

### Strict Gemini System Prompt Guardrails
The backend integrates Google Gemini 1.5 Flash using a strict JSON schema and non-negotiable prompt instructions:
1. Quote only short, exact passages from supplied transcripts.
2. Never invent customer information, company names, or deal valuations.
3. Never assume account relationships or employee roles.
4. Do not treat missing transcript as proof that no conversation occurred.
5. If evidence is insufficient, explicitly list the limitation in `not_established`.

### Structured Schema
```json
{
  "summary": "Concise factual summary of the interaction",
  "why_it_matters": "Business significance based solely on facts mentioned",
  "evidence": [
    {
      "turn": 14,
      "quote": "short exact transcript quote",
      "reason": "why this supports the conclusion"
    }
  ],
  "not_established": [
    "Explicit statement of what is NOT proven by the interaction"
  ],
  "recommended_actions": [
    {
      "action": "Specific concrete action",
      "owner": "Specific named person if verified, or null"
    }
  ],
  "suggested_routes": ["customer_follow_up"],
  "review_required": false
}
```

### Pre-Generated vs Runtime Analysis
- **Pre-generated Verified Analysis:** High-fidelity, human-verified analyses for all 18 conversations are embedded in `precomputed_data.py`. This ensures instant loading, zero latency, and 100% test reproducibility even when offline.
- **Runtime AI Execution:** Clicking `[Re-run Gemini Analysis]` dynamically prompts Gemini 1.5 Flash via the backend and updates the database.
- **Graceful Offline Degradation:** If Gemini is unreachable or rate-limited, the system falls back safely to verified baseline analyses without crashing.

---

## 12. Exports & Manifest Structure

Triggering `/api/export` generates physical files in `exports/` in both JSON and CSV formats:
```
exports/
├── revenue_intelligence_records.csv  # Complete tabular dataset of all 44 records & analyses (CSV)
├── manifest.json                     # Machine-readable manifest in JSON
├── manifest.csv                      # Machine-readable manifest in CSV
├── manager_brief.json                # Executive daily synthesis (JSON)
├── manager_brief.md                  # Executive daily synthesis (Markdown)
├── manager_brief_actions.csv         # Prioritized follow-ups & coaching observations (CSV)
├── revenue_intelligence_export.zip    # Downloadable ZIP bundle (contains all JSON, Markdown & CSV files)
├── conversations/                    # Individual record archives
│   ├── call_2ec4404c.../
│   │   ├── analysis.json
│   │   ├── metadata.json
│   │   └── transcript.txt
│   └── meeting_4f304fff.../
│       ├── analysis.json
│       ├── metadata.json
│       └── transcript.txt
└── routes/                           # Organized routing folders (JSON + CSV)
    ├── customer_follow_up/
    │   ├── records.json
    │   └── records.csv
    ├── deal_next_steps/
    │   ├── records.json
    │   └── records.csv
    ├── sales_coaching/
    ├── internal_vendor_note/
    └── needs_human_review/
```

### Raw Data Batch CSVs (`data/`)
In addition to the raw JSON envelopes, CSV versions of the incoming batches are stored in `data/`:
- `data/01_initial.csv`: 44 flattened records from initial-001 (calls and meetings).
- `data/02_update.csv`: Meeting M07 revision 2 with 27 transcript turns.
- Can be re-generated anytime using: `python scripts/export_data_to_csv.py`.

### CSV Export API Endpoints
- `GET /api/export/csv`: Streams `revenue_intelligence_records.csv` directly as a download attachment.
- `GET /api/export/manifest-csv`: Downloads `manifest.csv`.
- `GET /api/export/brief-csv`: Downloads `manager_brief_actions.csv`.
- `GET /api/records/export/csv`: Dynamic CSV export streaming that respects active inbox filters (`person`, `source_type`, `route`, `review_status`, `has_transcript`, `search`).

### Records Data CSV Schema (`revenue_intelligence_records.csv`)
| Column Header | Description |
|---|---|
| `source_type` | Record kind (`call` or `meeting`) |
| `source_id` | Immutable source UUID identity |
| `record_ref` | Human-readable identifier (`C01`, `M07`, `B01`) |
| `person` | Rep name or meeting organizer |
| `role_type` | `Sales Rep` or `Meeting Organizer` |
| `date` | Local interaction date (`2026-08-21`) |
| `started_at` | UTC ISO start timestamp |
| `duration_seconds` | Total duration |
| `talk_time_seconds` | Verifiable talk time |
| `direction` | Inbound / Outbound |
| `observed_outcome` | Upstream observed outcome flag |
| `external_id` | External call or meeting identifier |
| `status` | Record status (`active`) |
| `applied_revision` | Applied batch revision (1 or 2) |
| `transcript_available` | Whether usable text is present |
| `assigned_routes` | Semicolon-separated active destinations |
| `routing_source` | `ai_suggested` vs `manager_decision` |
| `manually_corrected` | Boolean override flag |
| `manual_route` | Manager override route (or `none`) |
| `review_state` | Intake review state (`current`, `needs_review`, `unavailable`) |
| `analysis_summary` | Verifiable factual interaction summary |
| `why_it_matters` | Business significance grounded strictly in evidence |
| `key_evidence_quotes` | Verbatim quote passages with turn references |
| `unsupported_boundaries` | Explicit boundary of what evidence does NOT establish |
| `recommended_actions` | Recommended next steps |
| `action_owners` | Explicit owners verified in transcript |


---

## 13. Five Presentation Slides

The complete text and defense notes for the 5 presentation slides are documented in [`docs/SLIDES.md`](docs/SLIDES.md).

---

## 14. Development Time & Known Limitations

- **Approximate Development Time:** ~7.5 hours (architecture design, database modeling, idempotent replay logic, evidence citation engine, React/Tailwind frontend, Gemini API integration, export generation, and documentation).
- **Known Limitations:**
  - Single-day dataset sample: all interactions fall on 21 August 2026.
  - Telephony calls provide raw text paragraphs rather than millisecond-accurate speaker turn timestamps.
  - Background calls and cancelled bot meetings contain null audio, preventing conversation conclusions.
