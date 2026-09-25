import os
import json
import csv
from pathlib import Path
from typing import Dict, Any, List

def convert_json_batch_to_csv(json_path: Path, csv_path: Path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    batch_id = data.get("batch_id", "")
    revision = data.get("revision", 1)
    exported_at = data.get("exported_at", "")
    records = data.get("records", [])

    rows = []
    for r in records:
        source_type = r.get("source_type", "")
        source_id = r.get("source_id", "")
        record_ref = r.get("record_ref", "")
        payload = r.get("payload", {})
        transcript_payload = r.get("transcript_payload") or {}

        # Extract normalized attributes
        person = ""
        person_email = ""
        started_at = ""
        duration_seconds = payload.get("duration_seconds") or 0
        talk_time_seconds = payload.get("talk_time_seconds") or 0
        direction = payload.get("direction") or ""
        observed_outcome = payload.get("observed_outcome") or ""
        external_id = payload.get("external_call_id") or payload.get("id") or ""
        title = payload.get("title") or ""
        provider = payload.get("provider") or ""
        attendee_count = payload.get("attendee_count") or 0
        recording_status = payload.get("recording_status") or ""
        raw_summary = payload.get("summary") or ""

        if source_type == "call":
            person = payload.get("rep_name") or ""
            person_email = payload.get("rep_email") or ""
            started_at = payload.get("started_at") or ""
            call_text = payload.get("transcript") or ""
            has_transcript = bool(call_text and call_text.strip())
            transcript_turns_count = len([l for l in call_text.strip().split("\n") if l.strip()]) if has_transcript else 0
            transcript_text = call_text
        else:
            person = payload.get("organizer_email") or ""
            person_email = payload.get("organizer_email") or ""
            started_at = payload.get("starts_at") or ""
            raw_turns = transcript_payload.get("turns") or []
            has_transcript = len(raw_turns) > 0
            transcript_turns_count = len(raw_turns)
            transcript_lines = []
            for t in raw_turns:
                spk = t.get("speaker", "Speaker")
                tc = t.get("timecode", "")
                txt = t.get("text", "")
                transcript_lines.append(f"[{spk} {tc}]: {txt}")
            transcript_text = "\n".join(transcript_lines)

        date = started_at[:10] if started_at else ""

        rows.append({
            "batch_id": batch_id,
            "revision": revision,
            "batch_exported_at": exported_at,
            "record_ref": record_ref,
            "source_type": source_type,
            "source_id": source_id,
            "person": person,
            "person_email": person_email,
            "date": date,
            "started_at": started_at,
            "duration_seconds": duration_seconds,
            "talk_time_seconds": talk_time_seconds,
            "direction": direction,
            "observed_outcome": observed_outcome,
            "external_id": external_id,
            "title": title,
            "provider": provider,
            "attendee_count": attendee_count,
            "recording_status": recording_status,
            "transcript_available": has_transcript,
            "transcript_turns_count": transcript_turns_count,
            "transcript_text": transcript_text,
            "raw_summary": raw_summary
        })

    if rows:
        fieldnames = list(rows[0].keys())
        with open(csv_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
    print(f"Exported {len(rows)} records from {json_path.name} to {csv_path.name}")

if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent
    data_dir = base_dir / "data"

    initial_json = data_dir / "01_initial.json"
    initial_csv = data_dir / "01_initial.csv"
    if initial_json.exists():
        convert_json_batch_to_csv(initial_json, initial_csv)

    update_json = data_dir / "02_update.json"
    update_csv = data_dir / "02_update.csv"
    if update_json.exists():
        convert_json_batch_to_csv(update_json, update_csv)
