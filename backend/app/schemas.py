from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class EvidenceItem(BaseModel):
    turn: Optional[int] = None
    quote: str
    reason: str

class RecommendedAction(BaseModel):
    action: str
    owner: Optional[str] = None

class AnalysisSchema(BaseModel):
    summary: str
    why_it_matters: str
    evidence: List[EvidenceItem] = []
    not_established: List[str] = []
    recommended_actions: List[RecommendedAction] = []
    suggested_routes: List[str] = []
    review_required: bool = False

class AnalysisResponse(BaseModel):
    id: int
    analysis_version: int
    generated_by: str
    source_revision: int
    status: str
    generated_at: str
    data: AnalysisSchema

class TranscriptTurn(BaseModel):
    turn: int
    speaker: Optional[str] = None
    timecode: Optional[str] = None
    text: str

class TranscriptResponse(BaseModel):
    id: int
    content: Optional[str] = None
    turns: List[TranscriptTurn] = []
    unavailable_reason: Optional[str] = None
    version: int

class ManualDecisionItem(BaseModel):
    id: int
    original_route: Optional[str] = None
    manual_route: str
    corrected_by: str
    reason: Optional[str] = None
    corrected_at: str

class RecordListItem(BaseModel):
    id: int
    source_type: str
    source_id: str
    record_ref: Optional[str] = None
    person: Optional[str] = None
    date: Optional[str] = None
    started_at: Optional[str] = None
    duration_seconds: float = 0.0
    status: str
    transcript_available: bool
    applied_revision: int
    current_routes: List[str] = []
    is_manually_corrected: bool = False
    manual_route: Optional[str] = None
    ai_suggested_routes: List[str] = []
    review_status: str  # 'needs_review' | 'reviewed' | 'no_transcript'
    attention_flag: Optional[str] = None

class RecordDetail(RecordListItem):
    metadata: Dict[str, Any] = {}
    transcript: Optional[TranscriptResponse] = None
    analysis: Optional[AnalysisResponse] = None
    manual_decisions: List[ManualDecisionItem] = []

class RouteUpdateRequest(BaseModel):
    routes: List[str]
    reason: Optional[str] = None
    corrected_by: Optional[str] = "Manager"

class DashboardMetrics(BaseModel):
    total_records: int
    total_calls: int
    total_meetings: int
    usable_transcripts_count: int
    transcript_coverage_pct: float
    transcript_coverage_numerator: int
    transcript_coverage_denominator: int
    calls_usable_transcripts: int
    calls_total: int
    meetings_usable_transcripts: int
    meetings_total: int
    source_reported_connected_calls: int
    source_reported_connection_pct: float
    routing_counts: Dict[str, int]
    review_counts: Dict[str, int]
    activity_by_person: List[Dict[str, Any]]
    activity_by_hour: List[Dict[str, Any]]
    source_type_breakdown: Dict[str, int]

class ImportResult(BaseModel):
    batch_id: str
    batch_type: str
    revision: int
    records_processed: int
    records_created: int
    records_updated: int
    duplicates_prevented: int
    message: str

class ImportRunItem(BaseModel):
    id: int
    batch_id: str
    batch_type: str
    revision: int
    records_processed: int
    records_created: int
    records_updated: int
    duplicates_prevented: int
    started_at: str
    completed_at: str

class ManagerBriefResponse(BaseModel):
    date: str
    timezone: str
    generated_at: str
    mode: str
    overview: str
    key_metrics: Dict[str, Any]
    critical_conversations: List[Dict[str, Any]]
    coaching_observations: List[Dict[str, Any]]
    follow_up_priorities: List[Dict[str, Any]]
    review_needed_items: List[Dict[str, Any]]
    unsupported_boundaries: List[str]
