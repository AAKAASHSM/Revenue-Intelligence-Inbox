import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from ..models import Record, Transcript, Route, Analysis, ImportRun
from ..config import settings
from .analysis_service import run_analysis_for_record

def parse_record_fields(r: Dict[str, Any], revision: int):
    source_type = r["source_type"]
    source_id = r["source_id"]
    record_ref = r.get("record_ref")
    payload = r.get("payload", {})
    transcript_payload = r.get("transcript_payload")

    # Extract common metadata
    person = None
    started_at = None
    duration_seconds = 0.0

    if source_type == "call":
        person = payload.get("rep_name") or payload.get("rep_email")
        started_at = payload.get("started_at")
        duration_seconds = float(payload.get("duration_seconds") or 0.0)
        call_text = payload.get("transcript")
        has_transcript = bool(call_text and call_text.strip())
        transcript_content = call_text or ""
        turns = []
        unavailable_reason = None if has_transcript else "No transcript supplied in this package."
        # If call text exists, build simple turns for unified display
        if has_transcript:
            lines = [l.strip() for l in call_text.strip().split("\n") if l.strip()]
            for idx, line in enumerate(lines, 1):
                turns.append({
                    "turn": idx,
                    "speaker": person or "Caller",
                    "timecode": None,
                    "text": line
                })
    else:  # meeting
        person = payload.get("organizer_email")
        started_at = payload.get("starts_at")
        duration_seconds = float(payload.get("duration_seconds") or 0.0)
        tp = transcript_payload or {}
        raw_turns = tp.get("turns") or []
        has_transcript = len(raw_turns) > 0
        unavailable_reason = tp.get("unavailable_reason")
        turns = []
        content_lines = []
        for idx, t in enumerate(raw_turns, 1):
            spk = t.get("speaker", "Speaker")
            tc = t.get("timecode", "")
            txt = t.get("text", "")
            turns.append({
                "turn": idx,
                "speaker": spk,
                "timecode": tc,
                "text": txt
            })
            content_lines.append(f"Turn {idx} [{spk} {tc}]: {txt}")
        transcript_content = "\n".join(content_lines)

    date_str = started_at[:10] if started_at else None

    return {
        "source_type": source_type,
        "source_id": source_id,
        "record_ref": record_ref,
        "person": person,
        "date": date_str,
        "started_at": started_at,
        "duration_seconds": duration_seconds,
        "status": "active",
        "transcript_available": has_transcript,
        "applied_revision": revision,
        "metadata_json": json.dumps(payload),
        "transcript_content": transcript_content,
        "turns_json": json.dumps(turns),
        "unavailable_reason": unavailable_reason
    }

async def import_batch_data(data: Dict[str, Any], batch_type: str, db: Session) -> Dict[str, Any]:
    batch_id = data.get("batch_id", f"batch_{int(datetime.utcnow().timestamp())}")
    revision = int(data.get("revision", 1))
    records_data = data.get("records", [])

    start_time = datetime.utcnow()
    records_processed = 0
    records_created = 0
    records_updated = 0
    duplicates_prevented = 0

    for r in records_data:
        records_processed += 1
        st = r["source_type"]
        sid = r["source_id"]

        # Check existing record by composite key (source_type, source_id)
        existing = db.query(Record).filter(
            Record.source_type == st,
            Record.source_id == sid
        ).first()

        parsed = parse_record_fields(r, revision)

        if not existing:
            # INSERT NEW RECORD
            new_rec = Record(
                source_type=parsed["source_type"],
                source_id=parsed["source_id"],
                record_ref=parsed["record_ref"],
                person=parsed["person"],
                date=parsed["date"],
                started_at=parsed["started_at"],
                duration_seconds=parsed["duration_seconds"],
                status=parsed["status"],
                transcript_available=parsed["transcript_available"],
                applied_revision=revision,
                metadata_json=parsed["metadata_json"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            db.add(new_rec)
            db.flush()

            # Add transcript record
            tr = Transcript(
                record_id=new_rec.id,
                content=parsed["transcript_content"],
                turns_json=parsed["turns_json"],
                unavailable_reason=parsed["unavailable_reason"],
                version=revision,
                received_at=datetime.utcnow()
            )
            db.add(tr)
            db.flush()

            # Create initial analysis
            await run_analysis_for_record(new_rec, db, force_ai=False)
            records_created += 1

        else:
            # RECORD EXISTS
            if revision <= existing.applied_revision:
                # Same or older revision arriving again -> IGNORE / DUPLICATE PREVENTED
                duplicates_prevented += 1
                continue

            # NEWER REVISION ARRIVING (e.g. revision 2 > revision 1)
            # Replace entire source payload and transcript_payload per Data Contract Rule 3
            records_updated += 1
            prev_transcript_available = existing.transcript_available

            existing.record_ref = parsed["record_ref"]
            existing.person = parsed["person"]
            existing.date = parsed["date"]
            existing.started_at = parsed["started_at"]
            existing.duration_seconds = parsed["duration_seconds"]
            existing.status = parsed["status"]
            existing.transcript_available = parsed["transcript_available"]
            existing.applied_revision = revision
            existing.metadata_json = parsed["metadata_json"]
            existing.updated_at = datetime.utcnow()

            # Update or create transcript
            if existing.transcript:
                existing.transcript.content = parsed["transcript_content"]
                existing.transcript.turns_json = parsed["turns_json"]
                existing.transcript.unavailable_reason = parsed["unavailable_reason"]
                existing.transcript.version = revision
                existing.transcript.received_at = datetime.utcnow()
            else:
                tr = Transcript(
                    record_id=existing.id,
                    content=parsed["transcript_content"],
                    turns_json=parsed["turns_json"],
                    unavailable_reason=parsed["unavailable_reason"],
                    version=revision,
                    received_at=datetime.utcnow()
                )
                db.add(tr)

            # Data Contract Rule 4 & 5:
            # "Keep candidate-derived analysis, processing state and manual routing decisions separate.
            # A newer source revision must not erase an explicit manual route.
            # When source text changes, refresh the analysis or mark it stale/pending review."
            if existing.analyses:
                latest_analysis = existing.analyses[0]
                # Mark as stale / needs_review because new source revision arrived
                latest_analysis.status = "needs_review"
                latest_analysis.source_revision = revision

            # If transcript newly arrived (like M07 in revision 2), generate the fresh analysis
            if not prev_transcript_available and parsed["transcript_available"]:
                # Generate new analysis reflecting revision 2
                await run_analysis_for_record(existing, db, force_ai=False)

    # Record Import Run
    import_run = ImportRun(
        batch_id=batch_id,
        batch_type=batch_type,
        revision=revision,
        records_processed=records_processed,
        records_created=records_created,
        records_updated=records_updated,
        duplicates_prevented=duplicates_prevented,
        started_at=start_time,
        completed_at=datetime.utcnow(),
        details_json=json.dumps({"batch_id": batch_id, "batch_type": batch_type, "revision": revision})
    )
    db.add(import_run)
    db.commit()

    return {
        "batch_id": batch_id,
        "batch_type": batch_type,
        "revision": revision,
        "records_processed": records_processed,
        "records_created": records_created,
        "records_updated": records_updated,
        "duplicates_prevented": duplicates_prevented,
        "message": f"Successfully processed {records_processed} records ({records_created} created, {records_updated} updated, {duplicates_prevented} duplicates prevented)."
    }

async def import_initial_file(db: Session) -> Dict[str, Any]:
    file_path = settings.DATA_DIR / "01_initial.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Initial file not found at {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return await import_batch_data(data, batch_type="initial", db=db)

async def import_update_file(db: Session) -> Dict[str, Any]:
    file_path = settings.DATA_DIR / "02_update.json"
    if not file_path.exists():
        raise FileNotFoundError(f"Update file not found at {file_path}")
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return await import_batch_data(data, batch_type="update", db=db)
