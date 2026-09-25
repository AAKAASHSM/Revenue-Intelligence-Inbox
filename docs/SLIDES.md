# 5-Slide Presentation: Revenue Intelligence Inbox

This document contains the presentation deck text, supporting source citations, and executive defense notes for the Revenue Intelligence Inbox application.

---

## Slide 1: Manager Problem & 3 Core Findings

### Header
**Grounded Sales Intelligence vs Unchecked CRM Hallucinations**

### 1. The Core Manager Problem
Sales managers face severe signal-to-noise friction across daily voice and video interactions. Typical AI tooling hallucinates pipeline values, fabricates company relationships, or incorrectly treats missing audio as proof of inactivity. Managers need a deterministic, evidence-backed workspace that distinguishes verified facts from assumptions, preserves manual human judgment, and maintains identity across updates.

### 2. Three Most Important Findings (With Exact Source Citations)

#### Finding 1: Critical UI Bug Reproducibility (M07 - Willowfield Trust)
- **Observation:** In meeting M07, Customer A reported that editing event-payment descriptions fails to persist after clicking save, reverting to earlier wording. The screen-share session verified an active frontend persistence defect.
- **Source Citation:** M07 Turn 2 & Turn 3:
  > *Turn 2:* "The first one is editing the description. I am changing this event-payment description to a short reference."
  > *Turn 3:* "The field still shows the earlier wording. So the change is not appearing after you save, is that right?"
- **Product Impact:** Routed to `internal_vendor_note` and spotlighted in the Manager Brief as a P0 engineering defect with screen-recording reproduction details.

#### Finding 2: Multi-Entity Tax Routing & Architectural Alignment (M02 - LedgerBridge)
- **Observation:** Prospect LedgerBridge clarified that their primary integration priority is electronic invoicing rather than corporate card issuance, requiring multi-entity subsidiary tax routing.
- **Source Citation:** M02 Turn 3 & Turn 12:
  > *Turn 3:* "Electronic invoicing is the bigger opportunity. Customers already have approved invoice layouts."
  > *Turn 12:* "We require multi-entity support where invoices can be routed across separate subsidiary tax IDs."
- **Product Impact:** Multi-routed to `deal_next_steps` and `internal_vendor_note` to ensure engineering verifies tax schema support before contract finalization.

#### Finding 3: Telephony Account & Spoken Identity Mismatch (C06 - Meera Account)
- **Observation:** The telephony metadata lists rep Meera, but the caller verbally identified himself as *"Good evening. Ravi here. I'll say at the start that this is a cold call."*
- **Source Citation:** C06 verbatim passage:
  > *"Hello? Good evening, Mr Nikhil. Good evening. Ravi here. I'll say at the start that this is a cold call."*
- **Product Impact:** Flagged in `sales_coaching` and marked for manager audit to detect shared telephony logins or incorrect caller profile assignment.

---

## Slide 2: Interface Choices & Deliberately Omitted Features

### Header
**Focus on High-Utility Desktop Workflows with Honest Uncertainty**

### 1. One Deliberately Rejected Decision
- **Alternative Considered:** Building an automated pipeline currency forecasting engine and a salesperson leaderboard ranking reps by call volume and conversion.
- **Reason for Rejection:** The supplied dataset contains zero CRM opportunity objects, no verified deal sizes (ACVs), and no company organizational hierarchy. Calculating pipeline values or conversion rankings would require fabricating numbers unsupported by source evidence.
- **Trade-off Accepted:** Replaced speculative leaderboards with honest conversation-based activity breakdowns, explicit denominators (e.g. 18/44 transcripts, 11/30 connection flags), and clear *"What Evidence Does NOT Establish"* disclosures on every record.

### 2. Interface Choices
- **Two-Column Synchronized Layout:** The left column renders identifiable transcript turns with timecodes; the right column renders intelligence. Clicking `[View Evidence]` scrolls and highlights the exact turn on the left.
- **Explicit Denominator Transparency:** Every metric displays its true denominator (e.g. Transcript Coverage: `18/44 = 40.9%`, Stored Connection Rate: `11/30 = 36.7%`).
- **Separation of AI Recommendation vs Manager Decision:** The UI clearly distinguishes AI suggestions from human overrides and displays a permanent audit trail.

---

## Slide 3: Routing Taxonomy & One Difficult Case

### Header
**Multi-Routing Support and Edge-Case Resolution**

### 1. Routing Taxonomy
A clean 5-category taxonomy avoids single-silo pigeonholing:
1. `customer_follow_up`: Action items directly involving external customer communication.
2. `deal_next_steps`: Commercial negotiations, pricing proposals, and contract agreements.
3. `sales_coaching`: Objection handling, telephony profile compliance, and pitch technique.
4. `internal_vendor_note`: Product bugs, integration constraints, and engineering roadmap dependencies.
5. `needs_human_review`: Ambiguous records or new source information awaiting manager review.

### 2. One Difficult Case: Cedarwave Distribution (M04)
- **The Dilemma:** In meeting M04, the customer reported POS card declines and expressed surprise that Apple/Google Pay digital wallet functionality was not yet available. Does this belong in customer follow-up, sales coaching, or product engineering?
- **Evidence:** M04 Turn 2 ("Much of your usage is physical-card spending. We have seen acceptance problems...") and Turn 3 ("I thought the wallet-payment option was coming to our existing cards too.").
- **Resolution:** The interaction was multi-assigned to `customer_follow_up` (relationship triage), `sales_coaching` (managing rep commitments around roadmap features), and flagged for `needs_human_review`. This prevents lost context across departments.

---

## Slide 4: Verification of Key Numbers & Conclusions

### Header
**Mathematical Rigor, Identity Invariance & Audit Integrity**

### 1. Key Metrics Verification
- **Identity Key Invariance:** Records are keyed strictly on `(source_type, source_id)`. Array positions, names, and references are treated as convenience labels.
- **Deduplication Proof:** Replaying the initial import against an existing 44-record database resulted in `0 records created` and `44 duplicates prevented`. Total count remained exactly 44.
- **Transcript Coverage Transition:** Initial batch delivered 17 usable transcripts (10 calls, 7 meetings) across 44 records (38.6%). The update batch delivered M07's 27 turns, shifting coverage to 18/44 (40.9%). Total records stayed 44 (never 45).
- **Stored Connection Rate:** 11 calls reported `is_connected=true` out of 30 total calls (36.7%). This metric is explicitly labeled as an upstream stored flag rather than a measure of conversation quality.

### 2. Analytical Conclusion Verification
- Every conclusion is pinned to an immutable turn number or short verbatim quotation.
- The UI contains no synthetic placeholders or speculative pipeline figures.

---

## Slide 5: Trade-offs, AI Usage, Limitations & Next Steps

### Header
**Production Reality, Failure Modes & Engineering Roadmap**

### 1. AI Usage & Resilience Architecture
- Backend integrates Google Gemini 1.5 Flash using a strict structured JSON schema.
- System prompt strictly prohibits customer hallucination, deal valuation, or assumption of role ownership.
- If Gemini is offline, the backend falls back to verified precomputed analyses without crashing.

### 2. Known Limitations
- Single-day dataset: All 44 records occur on 2026-08-21.
- Telephony transcripts lack sub-second turn segmentation.
- Unrecorded meetings provide no insight into whether an unrecorded conversation occurred.

### 3. Future Roadmap
- Webhook connectors for live Aircall/Zoom recording ingestion.
- Automated bidirectional syncing with Linear/Jira for bug reports (e.g. M07).
- Speaker diarization pipeline for two-channel telephony audio.
- LLM-as-a-judge evaluation harness to measure quote faithfulness.
