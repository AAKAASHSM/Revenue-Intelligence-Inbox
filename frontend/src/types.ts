export interface EvidenceItem {
  turn: number | null;
  quote: string;
  reason: string;
}

export interface RecommendedAction {
  action: string;
  owner: string | null;
}

export interface AnalysisData {
  summary: string;
  why_it_matters: string;
  evidence: EvidenceItem[];
  not_established: string[];
  recommended_actions: RecommendedAction[];
  suggested_routes: string[];
  review_required: boolean;
}

export interface AnalysisResponse {
  id: number;
  analysis_version: number;
  generated_by: string;
  source_revision: number;
  status: string;
  generated_at: string;
  data: AnalysisData;
}

export interface TranscriptTurn {
  turn: number;
  speaker: string | null;
  timecode: string | null;
  text: string;
}

export interface TranscriptResponse {
  id: number;
  content: string | null;
  turns: TranscriptTurn[];
  unavailable_reason: string | null;
  version: number;
}

export interface ManualDecisionItem {
  id: number;
  original_route: string | null;
  manual_route: string;
  corrected_by: string;
  reason: string | null;
  corrected_at: string;
}

export interface RecordListItem {
  id: number;
  source_type: 'call' | 'meeting';
  source_id: string;
  record_ref: string | null;
  person: string | null;
  date: string | null;
  started_at: string | null;
  duration_seconds: number;
  status: string;
  transcript_available: boolean;
  applied_revision: number;
  current_routes: string[];
  is_manually_corrected: boolean;
  manual_route: string | null;
  ai_suggested_routes: string[];
  review_status: 'needs_review' | 'reviewed' | 'no_transcript';
  attention_flag: string | null;
}

export interface RecordDetail extends RecordListItem {
  metadata: Record<string, any>;
  transcript: TranscriptResponse | null;
  analysis: AnalysisResponse | null;
  manual_decisions: ManualDecisionItem[];
}

export interface DashboardMetrics {
  total_records: number;
  total_calls: number;
  total_meetings: number;
  usable_transcripts_count: number;
  transcript_coverage_pct: number;
  transcript_coverage_numerator: number;
  transcript_coverage_denominator: number;
  calls_usable_transcripts: number;
  calls_total: number;
  meetings_usable_transcripts: number;
  meetings_total: number;
  source_reported_connected_calls: number;
  source_reported_connection_pct: number;
  routing_counts: Record<string, number>;
  review_counts: Record<string, number>;
  activity_by_person: {
    person: string;
    calls: number;
    meetings: number;
    total: number;
    transcripts: number;
  }[];
  activity_by_hour: {
    hour: string;
    count: number;
  }[];
  source_type_breakdown: {
    call: number;
    meeting: number;
  };
}

export interface ImportResult {
  batch_id: string;
  batch_type: string;
  revision: number;
  records_processed: number;
  records_created: number;
  records_updated: number;
  duplicates_prevented: number;
  message: string;
}

export interface ImportRunItem {
  id: number;
  batch_id: string;
  batch_type: string;
  revision: number;
  records_processed: number;
  records_created: number;
  records_updated: number;
  duplicates_prevented: number;
  started_at: string;
  completed_at: string;
}

export interface ManagerBriefResponse {
  date: string;
  timezone: string;
  generated_at: string;
  mode: string;
  overview: string;
  key_metrics: {
    total_records: number;
    calls_total: number;
    meetings_total: number;
    usable_transcripts: number;
    transcript_coverage: string;
    manual_corrections: number;
    needs_review_count: number;
  };
  critical_conversations: {
    record_ref: string;
    source_id: string;
    company_topic: string;
    impact: string;
    evidence_cite: string;
  }[];
  coaching_observations: {
    area: string;
    observation: string;
    evidence_cite: string;
  }[];
  follow_up_priorities: {
    priority: string;
    item: string;
    target: string;
  }[];
  review_needed_items: {
    ref: string;
    reason: string;
  }[];
  unsupported_boundaries: string[];
}
