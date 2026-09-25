import json
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Record, Route, ManualDecision, Analysis
from ..schemas import DashboardMetrics

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    records = db.query(Record).all()
    total_records = len(records)
    total_calls = sum(1 for r in records if r.source_type == "call")
    total_meetings = sum(1 for r in records if r.source_type == "meeting")

    calls_usable = sum(1 for r in records if r.source_type == "call" and r.transcript_available)
    meetings_usable = sum(1 for r in records if r.source_type == "meeting" and r.transcript_available)
    usable_total = calls_usable + meetings_usable

    coverage_pct = round((usable_total / total_records * 100), 1) if total_records > 0 else 0.0

    # Source-reported call connection rate
    connected_calls = 0
    calls_with_connection_field = 0
    for r in records:
        if r.source_type == "call" and r.metadata_json:
            try:
                p = json.loads(r.metadata_json)
                conn = p.get("is_connected")
                if conn is not None:
                    calls_with_connection_field += 1
                    if conn is True:
                        connected_calls += 1
            except Exception:
                pass

    conn_pct = round((connected_calls / calls_with_connection_field * 100), 1) if calls_with_connection_field > 0 else 0.0

    # Routing counts
    routing_counts = defaultdict(int)
    for r in records:
        active_routes = [rt.route for rt in r.routes if rt.is_active]
        if not active_routes:
            routing_counts["unassigned"] += 1
        else:
            for rt in active_routes:
                routing_counts[rt] += 1

    # Review counts
    review_counts = {
        "needs_review": 0,
        "reviewed": 0,
        "no_transcript": 0
    }
    for r in records:
        if not r.transcript_available:
            review_counts["no_transcript"] += 1
        elif r.analyses and r.analyses[0].status == "needs_review":
            review_counts["needs_review"] += 1
        elif any(rt.route == "needs_human_review" for rt in r.routes if rt.is_active):
            review_counts["needs_review"] += 1
        else:
            review_counts["reviewed"] += 1

    # Activity by person
    person_counts = defaultdict(lambda: {"person": "", "calls": 0, "meetings": 0, "total": 0, "transcripts": 0})
    for r in records:
        p_name = r.person or "Unassigned"
        person_counts[p_name]["person"] = p_name
        person_counts[p_name]["total"] += 1
        if r.source_type == "call":
            person_counts[p_name]["calls"] += 1
        else:
            person_counts[p_name]["meetings"] += 1
        if r.transcript_available:
            person_counts[p_name]["transcripts"] += 1

    activity_by_person = sorted(person_counts.values(), key=lambda x: x["total"], reverse=True)

    # Activity by hour (UTC / local)
    hour_counts = defaultdict(int)
    for r in records:
        if r.started_at and "T" in r.started_at:
            time_part = r.started_at.split("T")[1]
            hour = time_part[:2] + ":00"
            hour_counts[hour] += 1

    activity_by_hour = [{"hour": h, "count": count} for h, count in sorted(hour_counts.items())]

    return DashboardMetrics(
        total_records=total_records,
        total_calls=total_calls,
        total_meetings=total_meetings,
        usable_transcripts_count=usable_total,
        transcript_coverage_pct=coverage_pct,
        transcript_coverage_numerator=usable_total,
        transcript_coverage_denominator=total_records,
        calls_usable_transcripts=calls_usable,
        calls_total=total_calls,
        meetings_usable_transcripts=meetings_usable,
        meetings_total=total_meetings,
        source_reported_connected_calls=connected_calls,
        source_reported_connection_pct=conn_pct,
        routing_counts=dict(routing_counts),
        review_counts=review_counts,
        activity_by_person=activity_by_person,
        activity_by_hour=activity_by_hour,
        source_type_breakdown={"call": total_calls, "meeting": total_meetings}
    )
