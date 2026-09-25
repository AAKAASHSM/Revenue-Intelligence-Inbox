import {
  DashboardMetrics,
  RecordListItem,
  RecordDetail,
  ImportResult,
  ImportRunItem,
  ManagerBriefResponse,
  AnalysisResponse
} from './types';

const BASE_URL = 'http://127.0.0.1:8000/api';

export async function fetchDashboard(): Promise<DashboardMetrics> {
  const res = await fetch(`${BASE_URL}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function fetchRecords(params?: {
  person?: string;
  source_type?: string;
  route?: string;
  review_status?: string;
  has_transcript?: boolean;
  search?: string;
}): Promise<RecordListItem[]> {
  const query = new URLSearchParams();
  if (params?.person) query.set('person', params.person);
  if (params?.source_type) query.set('source_type', params.source_type);
  if (params?.route) query.set('route', params.route);
  if (params?.review_status) query.set('review_status', params.review_status);
  if (params?.has_transcript !== undefined) query.set('has_transcript', String(params.has_transcript));
  if (params?.search) query.set('search', params.search);

  const res = await fetch(`${BASE_URL}/records?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch records');
  return res.json();
}

export async function fetchRecordDetail(source_type: string, source_id: string): Promise<RecordDetail> {
  const res = await fetch(`${BASE_URL}/records/${source_type}/${source_id}`);
  if (!res.ok) throw new Error('Failed to fetch record detail');
  return res.json();
}

export async function updateRoute(
  recordId: number,
  routes: string[],
  reason?: string
): Promise<{ status: string; current_routes: string[]; manually_corrected: boolean }> {
  const res = await fetch(`${BASE_URL}/records/${recordId}/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ routes, reason, corrected_by: 'Manager' })
  });
  if (!res.ok) throw new Error('Failed to update route');
  return res.json();
}

export async function reanalyzeRecord(recordId: number, forceAi = true): Promise<AnalysisResponse> {
  const res = await fetch(`${BASE_URL}/records/${recordId}/analyze?force_ai=${forceAi}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to run AI analysis');
  return res.json();
}

export async function importInitialBatch(): Promise<ImportResult> {
  const res = await fetch(`${BASE_URL}/import/initial`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to import initial batch');
  return res.json();
}

export async function importUpdateBatch(): Promise<ImportResult> {
  const res = await fetch(`${BASE_URL}/import/update`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to import update batch');
  return res.json();
}

export async function replayInitialBatch(): Promise<ImportResult> {
  const res = await fetch(`${BASE_URL}/import/replay`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to replay initial batch');
  return res.json();
}

export async function resetDatabase(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${BASE_URL}/import/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset database');
  return res.json();
}

export async function fetchImportHistory(): Promise<ImportRunItem[]> {
  const res = await fetch(`${BASE_URL}/import/history`);
  if (!res.ok) throw new Error('Failed to fetch import history');
  return res.json();
}

export async function fetchManagerBrief(): Promise<ManagerBriefResponse> {
  const res = await fetch(`${BASE_URL}/manager-brief`);
  if (!res.ok) throw new Error('Failed to fetch manager brief');
  return res.json();
}

export async function triggerExport(): Promise<any> {
  const res = await fetch(`${BASE_URL}/export`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to generate export');
  return res.json();
}

export function getExportDownloadUrl(): string {
  return `${BASE_URL}/export/download`;
}

export function getExportCsvDownloadUrl(): string {
  return `${BASE_URL}/export/csv`;
}

export function getExportManifestCsvDownloadUrl(): string {
  return `${BASE_URL}/export/manifest-csv`;
}

export function getExportBriefCsvDownloadUrl(): string {
  return `${BASE_URL}/export/brief-csv`;
}

export function getFilteredRecordsCsvDownloadUrl(params?: {
  person?: string;
  source_type?: string;
  route?: string;
  review_status?: string;
  has_transcript?: boolean;
  search?: string;
}): string {
  const query = new URLSearchParams();
  if (params?.person && params.person !== 'all') query.set('person', params.person);
  if (params?.source_type && params.source_type !== 'all') query.set('source_type', params.source_type);
  if (params?.route && params.route !== 'all') query.set('route', params.route);
  if (params?.review_status && params.review_status !== 'all') query.set('review_status', params.review_status);
  if (params?.has_transcript !== undefined) query.set('has_transcript', String(params.has_transcript));
  if (params?.search && params.search.trim()) query.set('search', params.search.trim());

  const qStr = query.toString();
  return `${BASE_URL}/records/export/csv${qStr ? `?${qStr}` : ''}`;
}

