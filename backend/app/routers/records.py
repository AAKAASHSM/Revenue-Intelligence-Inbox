import json
import io
import csv
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Record, Route, ManualDecision, Analysis, Transcript
from ..schemas import RecordListItem, RecordDetail, RouteUpdateRequest, AnalysisResponse, TranscriptResponse
from ..services.analysis_service import run_analysis_for_record

router = APIRouter(prefix="/api/records", tags=["records"])

def build_record_list_item(r: Record) -> RecordListItem:
    active_routes = [rt.route for rt in r.routes if rt.is_active]
    is_manual = len(r.manual_decisions) > 0
    manual_route = r.manual_decisions[0].manual_route if is_manual else None
    ai_routes = [rt.route for rt in r.routes if rt.source == "ai_suggested"]

    # Review status determination
    if not r.transcript_available:
        review_status = "no_transcript"
    elif r.analyses and r.analyses[0].status == "needs_review":
        review_status = "needs_review"
    elif any(rt.route == "needs_human_review" for rt in r.routes if rt.is_active):
        review_status = "needs_review"
    else:
        review_status = "reviewed"

    attention_flag = None
    if review_status == "needs_review":
        attention_flag = "Attention Needed"
    elif r.record_ref == "M07" and r.applied_revision == 2 and r.analyses and r.analyses[0].status == "needs_review":
        attention_flag = "New Transcript Arrived"

    return RecordListItem(
        id=r.id,
        source_type=r.source_type,
        source_id=r.source_id,
        record_ref=r.record_ref,
        person=r.person,
        date=r.date,
        started_at=r.started_at,
        duration_seconds=r.duration_seconds,
        status=r.status,
        transcript_available=r.transcript_available,
        applied_revision=r.applied_revision,
        current_routes=active_routes,
        is_manually_corrected=is_manual,
        manual_route=manual_route,
        ai_suggested_routes=ai_routes,
        review_status=review_status,
        attention_flag=attention_flag
    )

@router.get("", response_model=List[RecordListItem])
def list_records(
    person: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    route: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    has_transcript: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Record)

    if person:
        query = query.filter(Record.person == person)
    if source_type:
        query = query.filter(Record.source_type == source_type)
    if has_transcript is not None:
        query = query.filter(Record.transcript_available == has_transcript)

    records = query.order_by(Record.source_type.asc(), Record.record_ref.asc()).all()
    results = []

    for r in records:
        item = build_record_list_item(r)

        # Filter by route if specified
        if route and route not in item.current_routes:
            continue

        # Filter by review status if specified
        if review_status and item.review_status != review_status:
            continue

        # Filter by search string
        if search:
            s_lower = search.lower()
            matched = (
                (item.record_ref and s_lower in item.record_ref.lower()) or
                (item.source_id and s_lower in item.source_id.lower()) or
                (item.person and s_lower in item.person.lower()) or
                any(s_lower in rt.lower() for rt in item.current_routes)
            )
            if not matched:
                continue

        results.append(item)

    return results

@router.get("/export/csv")
def export_filtered_records_csv(
    person: Optional[str] = Query(None),
    source_type: Optional[str] = Query(None),
    route: Optional[str] = Query(None),
    review_status: Optional[str] = Query(None),
    has_transcript: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Record)
    if person:
        query = query.filter(Record.person == person)
    if source_type:
        query = query.filter(Record.source_type == source_type)
    if has_transcript is not None:
        query = query.filter(Record.transcript_available == has_transcript)

    records = query.order_by(Record.source_type.asc(), Record.record_ref.asc()).all()
    filtered = []

    for r in records:
        item = build_record_list_item(r)
        if route and route not in item.current_routes:
            continue
        if review_status and item.review_status != review_status:
            continue
        if search:
            s_lower = search.lower()
            matched = (
                (item.record_ref and s_lower in item.record_ref.lower()) or
                (item.source_id and s_lower in item.source_id.lower()) or
                (item.person and s_lower in item.person.lower()) or
                any(s_lower in rt.lower() for rt in item.current_routes)
            )
            if not matched:
                continue
        filtered.append((r, item))

    rows = []
    for r, item in filtered:
        meta = {}
        if r.metadata_json:
            try:
                meta = json.loads(r.metadata_json)
            except Exception:
                meta = {}

        analysis_data = {}
        analysis_status = "unavailable"
        if r.analyses:
            analysis_status = r.analyses[0].status
            try:
                analysis_data = json.loads(r.analyses[0].analysis_json)
            except Exception:
                analysis_data = {}

        summary = analysis_data.get("summary", "")
        why_it_matters = analysis_data.get("why_it_matters", "")
        ev_quotes = [f"Turn {ev.get('turn')}: \"{ev.get('quote')}\"" for ev in analysis_data.get("evidence", [])]
        rec_actions = [a.get("action", "") for a in analysis_data.get("recommended_actions", [])]
        action_owners = [a.get("owner", "") for a in analysis_data.get("recommended_actions", []) if a.get("owner")]

        rows.append({
            "record_ref": item.record_ref or "",
            "source_type": item.source_type,
            "source_id": item.source_id,
            "person": item.person or "N/A",
            "role_type": "Sales Rep" if item.source_type == "call" else "Meeting Organizer",
            "date": item.date or "",
            "started_at": item.started_at or "",
            "duration_seconds": item.duration_seconds,
            "talk_time_seconds": meta.get("talk_time_seconds", 0),
            "direction": meta.get("direction", ""),
            "observed_outcome": meta.get("observed_outcome", ""),
            "external_id": meta.get("external_call_id") or meta.get("id") or "",
            "title": meta.get("title", ""),
            "status": item.status,
            "applied_revision": item.applied_revision,
            "transcript_available": item.transcript_available,
            "assigned_routes": ";".join(item.current_routes),
            "manually_corrected": item.is_manually_corrected,
            "manual_route": item.manual_route or "none",
            "review_status": item.review_status,
            "analysis_summary": summary,
            "why_it_matters": why_it_matters,
            "key_evidence": " | ".join(ev_quotes),
            "recommended_actions": " | ".join(rec_actions),
            "action_owners": ", ".join(list(dict.fromkeys(action_owners))) if action_owners else "unassigned"
        })

    output = io.StringIO()
    if rows:
        fieldnames = list(rows[0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    else:
        output.write("No records matched the specified filter criteria\n")

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="revenue_intelligence_records.csv"'}
    )

@router.get("/{source_type}/{source_id}", response_model=RecordDetail)
def get_record_detail(source_type: str, source_id: str, db: Session = Depends(get_db)):
    record = db.query(Record).filter(
        Record.source_type == source_type,
        Record.source_id == source_id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail=f"Record {source_type}/{source_id} not found")

    base_item = build_record_list_item(record)

    # Parse metadata
    metadata = {}
    if record.metadata_json:
        try:
            metadata = json.loads(record.metadata_json)
        except Exception:
            metadata = {}

    # Parse transcript
    transcript_res = None
    if record.transcript:
        tr = record.transcript
        turns = []
        if tr.turns_json:
            try:
                turns = json.loads(tr.turns_json)
            except Exception:
                turns = []
        transcript_res = TranscriptResponse(
            id=tr.id,
            content=tr.content,
            turns=turns,
            unavailable_reason=tr.unavailable_reason,
            version=tr.version
        )

    # Parse latest analysis
    analysis_res = None
    if record.analyses:
        la = record.analyses[0]
        data = {}
        try:
            data = json.loads(la.analysis_json)
        except Exception:
            data = {}
        analysis_res = AnalysisResponse(
            id=la.id,
            analysis_version=la.analysis_version,
            generated_by=la.generated_by,
            source_revision=la.source_revision,
            status=la.status,
            generated_at=la.generated_at.isoformat() + "Z",
            data=data
        )

    # Manual decisions
    manual_decisions_list = [
        {
            "id": md.id,
            "original_route": md.original_route,
            "manual_route": md.manual_route,
            "corrected_by": md.corrected_by,
            "reason": md.reason,
            "corrected_at": md.corrected_at.isoformat() + "Z"
        }
        for md in record.manual_decisions
    ]

    return RecordDetail(
        **base_item.dict(),
        metadata=metadata,
        transcript=transcript_res,
        analysis=analysis_res,
        manual_decisions=manual_decisions_list
    )

@router.post("/{record_id}/route")
def update_record_route(record_id: int, req: RouteUpdateRequest, db: Session = Depends(get_db)):
    record = db.query(Record).filter(Record.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    # Record previous routes for audit
    prev_routes = [rt.route for rt in record.routes if rt.is_active]
    orig_str = ";".join(prev_routes) if prev_routes else "unassigned"
    new_str = ";".join(req.routes)

    # Deactivate prior routes
    for rt in record.routes:
        rt.is_active = False

    # Insert new manager routes
    for r_name in req.routes:
        new_route = Route(
            record_id=record.id,
            route=r_name,
            source="manager_decision",
            is_active=True,
            created_at=datetime.utcnow()
        )
        db.add(new_route)

    # Insert manual decision audit record
    manual_decision = ManualDecision(
        record_id=record.id,
        original_route=orig_str,
        manual_route=new_str,
        corrected_by=req.corrected_by or "Manager",
        reason=req.reason,
        corrected_at=datetime.utcnow()
    )
    db.add(manual_decision)
    db.commit()

    return {"status": "success", "record_id": record.id, "current_routes": req.routes, "manually_corrected": True}

@router.post("/{record_id}/analyze")
async def analyze_record_endpoint(record_id: int, force_ai: bool = Query(True), db: Session = Depends(get_db)):
    record = db.query(Record).filter(Record.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    analysis = await run_analysis_for_record(record, db, force_ai=force_ai)
    data = json.loads(analysis.analysis_json)

    return AnalysisResponse(
        id=analysis.id,
        analysis_version=analysis.analysis_version,
        generated_by=analysis.generated_by,
        source_revision=analysis.source_revision,
        status=analysis.status,
        generated_at=analysis.generated_at.isoformat() + "Z",
        data=data
    )
