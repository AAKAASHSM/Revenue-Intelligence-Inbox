import os
import json
import csv
import shutil
import zipfile
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models import Record, Route, ManualDecision, Analysis, Transcript
from ..config import settings
from .manager_brief_service import generate_manager_brief

def generate_full_export(db: Session) -> Dict[str, Any]:
    export_dir = settings.EXPORTS_DIR
    # Clean and recreate export directory
    if export_dir.exists():
        for item in export_dir.iterdir():
            if item.is_dir():
                shutil.rmtree(item)
            elif item.name != ".gitkeep":
                item.unlink()
    else:
        export_dir.mkdir(parents=True, exist_ok=True)

    conversations_dir = export_dir / "conversations"
    routes_dir = export_dir / "routes"
    conversations_dir.mkdir(exist_ok=True)
    routes_dir.mkdir(exist_ok=True)

    records = db.query(Record).all()
    manifest_rows = []
    records_csv_rows = []

    # Map of routes to records for organized routing folders
    route_membership: Dict[str, List[Dict[str, Any]]] = {}

    for r in records:
        source_type = r.source_type
        source_id = r.source_id
        ref = r.record_ref or f"{source_type}_{source_id[:8]}"

        # Identify active routes
        active_routes = [rt.route for rt in r.routes if rt.is_active]
        if not active_routes:
            active_routes = ["unassigned"]

        # Check manual decision
        is_manual = len(r.manual_decisions) > 0
        manual_route = r.manual_decisions[0].manual_route if is_manual else None
        manual_reason = r.manual_decisions[0].reason if is_manual else ""

        # Check latest analysis
        latest_analysis = r.analyses[0] if r.analyses else None
        analysis_data = {}
        analysis_status = "unavailable"
        if latest_analysis:
            analysis_status = latest_analysis.status
            try:
                analysis_data = json.loads(latest_analysis.analysis_json)
            except Exception:
                analysis_data = {}

        # Conversation folder: conversations/<source_type>_<source_id>/
        conv_folder_name = f"{source_type}_{source_id}"
        rec_dir = conversations_dir / conv_folder_name
        rec_dir.mkdir(parents=True, exist_ok=True)

        # Write analysis.json
        analysis_file = rec_dir / "analysis.json"
        with open(analysis_file, "w", encoding="utf-8") as f:
            json.dump({
                "source_type": source_type,
                "source_id": source_id,
                "record_ref": ref,
                "applied_revision": r.applied_revision,
                "analysis_status": analysis_status,
                "assigned_routes": active_routes,
                "is_manually_corrected": is_manual,
                "manual_route": manual_route,
                "manual_reason": manual_reason,
                "analysis": analysis_data
            }, f, indent=2)

        # Write transcript.txt if available
        transcript_file = None
        if r.transcript and r.transcript.content:
            transcript_file = rec_dir / "transcript.txt"
            with open(transcript_file, "w", encoding="utf-8") as f:
                f.write(r.transcript.content)

        # Write raw metadata.json
        metadata_file = rec_dir / "metadata.json"
        with open(metadata_file, "w", encoding="utf-8") as f:
            f.write(r.metadata_json or "{}")

        rel_paths = [
            f"conversations/{conv_folder_name}/analysis.json",
            f"conversations/{conv_folder_name}/metadata.json"
        ]
        if transcript_file:
            rel_paths.append(f"conversations/{conv_folder_name}/transcript.txt")

        # Parse raw payload metadata
        try:
            meta = json.loads(r.metadata_json or "{}")
        except Exception:
            meta = {}

        direction = meta.get("direction", "")
        observed_outcome = meta.get("observed_outcome", "")
        talk_time_seconds = meta.get("talk_time_seconds", 0)
        external_id = meta.get("external_call_id") or meta.get("id") or ""
        title = meta.get("title", "")
        provider = meta.get("provider", "")

        # Extract structured intelligence fields
        summary = analysis_data.get("summary", "")
        why_it_matters = analysis_data.get("why_it_matters", "")
        evidence_list = analysis_data.get("evidence", [])
        evidence_quotes = []
        for ev in evidence_list:
            turn_no = ev.get("turn", "")
            q_text = ev.get("quote", "")
            r_text = ev.get("reason", "")
            evidence_quotes.append(f"Turn {turn_no}: \"{q_text}\" ({r_text})")
        key_evidence_str = " | ".join(evidence_quotes)

        not_est_list = analysis_data.get("not_established", [])
        not_established_str = " | ".join(not_est_list) if isinstance(not_est_list, list) else str(not_est_list)

        rec_actions = analysis_data.get("recommended_actions", [])
        action_texts = []
        action_owners = []
        for a in rec_actions:
            action_texts.append(a.get("action", ""))
            if a.get("owner"):
                action_owners.append(a.get("owner"))
        actions_str = " | ".join(action_texts)
        owners_str = ", ".join(list(dict.fromkeys(action_owners))) if action_owners else "unassigned"

        # Manifest row
        manifest_rows.append({
            "source_type": source_type,
            "source_id": source_id,
            "record_ref": ref,
            "person": r.person or "N/A",
            "date": r.date or "N/A",
            "applied_revision": r.applied_revision,
            "transcript_available": r.transcript_available,
            "assigned_routes": ";".join(active_routes),
            "output_paths": ";".join(rel_paths),
            "processing_state": r.status,
            "review_state": analysis_status,
            "manually_corrected": is_manual,
            "manual_route": manual_route or "none",
            "analysis_freshness": "current" if analysis_status == "current" else "stale/needs_review"
        })

        # Comprehensive data export row (Full CSV Dataset)
        records_csv_rows.append({
            "source_type": source_type,
            "source_id": source_id,
            "record_ref": ref,
            "person": r.person or "N/A",
            "role_type": "Sales Rep" if source_type == "call" else "Meeting Organizer",
            "date": r.date or "N/A",
            "started_at": r.started_at or "N/A",
            "duration_seconds": r.duration_seconds,
            "talk_time_seconds": talk_time_seconds,
            "direction": direction,
            "observed_outcome": observed_outcome,
            "external_id": external_id,
            "title": title,
            "provider": provider,
            "status": r.status,
            "applied_revision": r.applied_revision,
            "transcript_available": r.transcript_available,
            "assigned_routes": ";".join(active_routes),
            "routing_source": "manager_decision" if is_manual else "ai_suggested",
            "manually_corrected": is_manual,
            "manual_route": manual_route or "none",
            "review_state": analysis_status,
            "analysis_summary": summary,
            "why_it_matters": why_it_matters,
            "key_evidence_quotes": key_evidence_str,
            "unsupported_boundaries": not_established_str,
            "recommended_actions": actions_str,
            "action_owners": owners_str
        })

        # Add to route folders
        first_action = action_texts[0] if action_texts else ""
        first_owner = action_owners[0] if action_owners else "unassigned"
        for rt in active_routes:
            if rt not in route_membership:
                route_membership[rt] = []
            route_membership[rt].append({
                "source_type": source_type,
                "source_id": source_id,
                "record_ref": ref,
                "person": r.person,
                "date": r.date,
                "duration_seconds": r.duration_seconds,
                "assigned_routes": ";".join(active_routes),
                "manually_corrected": is_manual,
                "review_state": analysis_status,
                "summary": summary,
                "key_action": first_action,
                "action_owner": first_owner,
                "detail_link": f"conversations/{conv_folder_name}/analysis.json"
            })

    # Write organized route files: routes/<route_name>/records.json AND records.csv
    for rt, items in route_membership.items():
        rt_dir = routes_dir / rt
        rt_dir.mkdir(parents=True, exist_ok=True)
        # JSON format
        with open(rt_dir / "records.json", "w", encoding="utf-8") as f:
            json.dump({
                "route": rt,
                "record_count": len(items),
                "records": items
            }, f, indent=2)
        # CSV format
        if items:
            headers = list(items[0].keys())
            with open(rt_dir / "records.csv", "w", newline="", encoding="utf-8") as f:
                writer = csv.DictWriter(f, fieldnames=headers)
                writer.writeheader()
                writer.writerows(items)

    # Generate manager brief
    brief = generate_manager_brief(db)
    brief_file_json = export_dir / "manager_brief.json"
    with open(brief_file_json, "w", encoding="utf-8") as f:
        json.dump(brief, f, indent=2)

    brief_file_md = export_dir / "manager_brief.md"
    with open(brief_file_md, "w", encoding="utf-8") as f:
        f.write(f"# Manager Brief - {brief['date']} ({brief['timezone']})\n\n")
        f.write(f"{brief['overview']}\n\n")
        f.write("## Key Calculated Metrics\n")
        for k, v in brief['key_metrics'].items():
            f.write(f"- **{k}**: {v}\n")
        f.write("\n## High-Impact Conversations\n")
        for c in brief['critical_conversations']:
            f.write(f"### {c['record_ref']} - {c['company_topic']}\n")
            f.write(f"{c['impact']}\n")
            f.write(f"*Evidence Citation:* `{c['evidence_cite']}`\n\n")
        f.write("\n## Coaching Observations\n")
        for co in brief['coaching_observations']:
            f.write(f"- **{co['area']}**: {co['observation']}\n  *(Citation: `{co['evidence_cite']}`)*\n")
        f.write("\n## Follow-up Priorities\n")
        for fp in brief['follow_up_priorities']:
            f.write(f"- [{fp['priority']}] {fp['item']} *(Owner: {fp['target']})*\n")
        f.write("\n## Evidence Boundaries\n")
        for b in brief['unsupported_boundaries']:
            f.write(f"- {b}\n")

    # Write manager brief actions CSV: exports/manager_brief_actions.csv
    brief_actions_rows = []
    for c in brief.get('critical_conversations', []):
        brief_actions_rows.append({
            "category": "High-Impact Account",
            "reference": c.get('record_ref', ''),
            "topic_or_area": c.get('company_topic', ''),
            "summary_or_observation": c.get('impact', ''),
            "priority": "High",
            "owner": "N/A",
            "evidence_citation": c.get('evidence_cite', '')
        })
    for co in brief.get('coaching_observations', []):
        brief_actions_rows.append({
            "category": "Coaching Observation",
            "reference": co.get('area', ''),
            "topic_or_area": co.get('area', ''),
            "summary_or_observation": co.get('observation', ''),
            "priority": "Medium",
            "owner": "Sales Manager",
            "evidence_citation": co.get('evidence_cite', '')
        })
    for fp in brief.get('follow_up_priorities', []):
        brief_actions_rows.append({
            "category": "Follow-up Priority",
            "reference": fp.get('target', ''),
            "topic_or_area": fp.get('item', ''),
            "summary_or_observation": fp.get('item', ''),
            "priority": fp.get('priority', ''),
            "owner": fp.get('target', ''),
            "evidence_citation": ""
        })

    brief_file_csv = export_dir / "manager_brief_actions.csv"
    if brief_actions_rows:
        b_headers = list(brief_actions_rows[0].keys())
        with open(brief_file_csv, "w", newline="", encoding="utf-8") as f:
            b_writer = csv.DictWriter(f, fieldnames=b_headers)
            b_writer.writeheader()
            b_writer.writerows(brief_actions_rows)

    # Write manifest.json
    manifest_file_json = export_dir / "manifest.json"
    with open(manifest_file_json, "w", encoding="utf-8") as f:
        json.dump({
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "total_records": len(manifest_rows),
            "records": manifest_rows
        }, f, indent=2)

    # Write manifest.csv
    manifest_file_csv = export_dir / "manifest.csv"
    if manifest_rows:
        headers = list(manifest_rows[0].keys())
        with open(manifest_file_csv, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=headers)
            writer.writeheader()
            writer.writerows(manifest_rows)

    # Write full dataset CSV: exports/revenue_intelligence_records.csv
    records_file_csv = export_dir / "revenue_intelligence_records.csv"
    if records_csv_rows:
        r_headers = list(records_csv_rows[0].keys())
        with open(records_file_csv, "w", newline="", encoding="utf-8") as f:
            r_writer = csv.DictWriter(f, fieldnames=r_headers)
            r_writer.writeheader()
            r_writer.writerows(records_csv_rows)

    # Generate ZIP archive containing all folders, JSON, and CSV files
    zip_path = export_dir / "revenue_intelligence_export.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(export_dir):
            for file in files:
                file_p = Path(root) / file
                if file_p.name == "revenue_intelligence_export.zip":
                    continue
                arcname = file_p.relative_to(export_dir)
                zipf.write(file_p, arcname)

    return {
        "status": "success",
        "export_directory": str(export_dir),
        "total_records": len(manifest_rows),
        "manifest_json": str(manifest_file_json),
        "manifest_csv": str(manifest_file_csv),
        "records_csv": str(records_file_csv),
        "manager_brief_json": str(brief_file_json),
        "manager_brief_md": str(brief_file_md),
        "manager_brief_csv": str(brief_file_csv),
        "zip_archive": str(zip_path),
        "generated_at": datetime.utcnow().isoformat() + "Z"
    }
