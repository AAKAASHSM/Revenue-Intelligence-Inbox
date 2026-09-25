import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  Archive,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  FileText
} from 'lucide-react';
import { ImportResult, ImportRunItem } from '../types';
import {
  importInitialBatch,
  importUpdateBatch,
  replayInitialBatch,
  resetDatabase,
  fetchImportHistory,
  triggerExport,
  getExportDownloadUrl,
  getExportCsvDownloadUrl,
  getExportManifestCsvDownloadUrl,
  getExportBriefCsvDownloadUrl
} from '../api';

interface ImportReplayViewProps {
  onRefreshAll: () => void;
}

export const ImportReplayView: React.FC<ImportReplayViewProps> = ({ onRefreshAll }) => {
  const [history, setHistory] = useState<ImportRunItem[]>([]);
  const [lastResult, setLastResult] = useState<ImportResult | null>(null);
  const [exportResult, setExportResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const runs = await fetchImportHistory();
      setHistory(runs);
    } catch (err) {
      console.error('Failed to load import history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleImportInitial = async () => {
    try {
      setIsLoading('initial');
      const res = await importInitialBatch();
      setLastResult(res);
      await loadHistory();
      onRefreshAll();
    } catch (err) {
      alert('Error importing initial batch: ' + String(err));
    } finally {
      setIsLoading(null);
    }
  };

  const handleReplayInitial = async () => {
    try {
      setIsLoading('replay');
      const res = await replayInitialBatch();
      setLastResult(res);
      await loadHistory();
      onRefreshAll();
    } catch (err) {
      alert('Error replaying initial batch: ' + String(err));
    } finally {
      setIsLoading(null);
    }
  };

  const handleImportUpdate = async () => {
    try {
      setIsLoading('update');
      const res = await importUpdateBatch();
      setLastResult(res);
      await loadHistory();
      onRefreshAll();
    } catch (err) {
      alert('Error importing update batch: ' + String(err));
    } finally {
      setIsLoading(null);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset database to clean empty state? You can re-import batches immediately.')) {
      return;
    }
    try {
      setIsLoading('reset');
      await resetDatabase();
      setLastResult(null);
      setExportResult(null);
      await loadHistory();
      onRefreshAll();
      alert('Database successfully reset to clean state.');
    } catch (err) {
      alert('Error resetting database: ' + String(err));
    } finally {
      setIsLoading(null);
    }
  };

  const handleGenerateExport = async () => {
    try {
      setIsLoading('export');
      const res = await triggerExport();
      setExportResult(res);
      alert('Export successfully generated! Download ZIP archive below.');
    } catch (err) {
      alert('Error generating export: ' + String(err));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Data Import & Export Control Panel
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Test harness for idempotent imports, revision ordering, late transcript updates, and export generation.
        </p>
      </div>

      {/* Action Buttons Hub */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Primary Dataset Operations</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 1. Initial Import */}
          <button
            onClick={handleImportInitial}
            disabled={isLoading !== null}
            className="flex items-center justify-between p-3.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Import Initial Batch</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">01_initial (44 recs)</span>
          </button>

          {/* 2. Replay Duplicate Test */}
          <button
            onClick={handleReplayInitial}
            disabled={isLoading !== null}
            className="flex items-center justify-between p-3.5 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              <span>Import Initial Batch Again</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Duplicate Test</span>
          </button>

          {/* 3. Update Batch */}
          <button
            onClick={handleImportUpdate}
            disabled={isLoading !== null}
            className="flex items-center justify-between p-3.5 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-lg hover:bg-indigo-100 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Import Update Batch</span>
            </div>
            <span className="text-[11px] text-indigo-600 font-mono">02_update (M07 Rev 2)</span>
          </button>

          {/* 4. Reset Application */}
          <button
            onClick={handleReset}
            disabled={isLoading !== null}
            className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg hover:bg-rose-100 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Database</span>
            </div>
            <span className="text-[11px] text-rose-600 font-mono">Clean Slate</span>
          </button>

          {/* 5. Generate Export */}
          <button
            onClick={handleGenerateExport}
            disabled={isLoading !== null}
            className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Generate Export Files</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-mono">Manifest & CSVs</span>
          </button>

          {/* 6. Download Records Data CSV */}
          <a
            href={getExportCsvDownloadUrl()}
            download="revenue_intelligence_records.csv"
            className="flex items-center justify-between p-3.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-xs font-semibold shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-white" />
              <span>Download Records (CSV)</span>
            </div>
            <span className="text-[11px] text-emerald-100 font-mono">Full Dataset</span>
          </a>

          {/* 7. Download Manifest CSV */}
          <a
            href={getExportManifestCsvDownloadUrl()}
            download="manifest.csv"
            className="flex items-center justify-between p-3.5 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>Download Manifest (CSV)</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Index & Routes</span>
          </a>

          {/* 8. Download ZIP Archive */}
          <a
            href={getExportDownloadUrl()}
            download="revenue_intelligence_export.zip"
            className="flex items-center justify-between p-3.5 bg-white border border-slate-300 text-slate-800 rounded-lg hover:bg-slate-50 transition-colors text-xs font-semibold"
          >
            <div className="flex items-center space-x-2">
              <Download className="w-4 h-4 text-slate-700" />
              <span>Download ZIP Archive</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Complete Bundle</span>
          </a>
        </div>
      </div>

      {/* Export Result Feedback Banner */}
      {exportResult && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-950">Export Files & CSV Datasets Successfully Generated</h3>
            </div>
            <span className="font-mono text-xs text-emerald-800 font-semibold">{exportResult.total_records} Records Exported</span>
          </div>

          <p className="text-xs text-emerald-800">
            Exported to local folder: <code className="bg-white px-1.5 py-0.5 rounded font-mono text-[11px] border border-emerald-300">{exportResult.export_directory}</code>
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href={getExportCsvDownloadUrl()}
              download="revenue_intelligence_records.csv"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Records Data (CSV)</span>
            </a>
            <a
              href={getExportManifestCsvDownloadUrl()}
              download="manifest.csv"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-100 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download Manifest (CSV)</span>
            </a>
            <a
              href={getExportBriefCsvDownloadUrl()}
              download="manager_brief_actions.csv"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-100 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download Manager Brief (CSV)</span>
            </a>
            <a
              href={getExportDownloadUrl()}
              download="revenue_intelligence_export.zip"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-100 shadow-sm"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Download Complete ZIP</span>
            </a>
          </div>
        </div>
      )}

      {/* Live Result Feedback Banner */}
      {lastResult && (
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Latest Import Execution Result</h3>
            </div>
            <span className="font-mono text-xs text-slate-500 uppercase">Batch ID: {lastResult.batch_id}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Records Processed</span>
              <span className="text-lg font-bold text-slate-900">{lastResult.records_processed}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">New Created</span>
              <span className="text-lg font-bold text-emerald-700">{lastResult.records_created}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Existing Updated</span>
              <span className="text-lg font-bold text-indigo-700">{lastResult.records_updated}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Duplicates Prevented</span>
              <span className="text-lg font-bold text-amber-700">{lastResult.duplicates_prevented}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-medium">
            {lastResult.message}
          </p>
        </div>
      )}

      {/* Replay Verification Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-900">Interactive Replay Verification Guide</h2>
        <p className="text-xs text-slate-500">
          The exact test steps required to demonstrate data integrity and revision preservation:
        </p>

        <div className="space-y-2.5 text-xs text-slate-700">
          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200 rounded">Step 1</span>
            <div>
              <p className="font-semibold text-slate-900">Import Initial Batch (01_initial.json)</p>
              <p className="text-slate-500">Loads 44 distinct source records (30 calls, 14 meetings, 17 usable transcripts).</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200 rounded">Step 2</span>
            <div>
              <p className="font-semibold text-slate-900">Repeat Import of Initial Batch</p>
              <p className="text-slate-500">Verifies duplicate prevention: 0 records created, 44 duplicates prevented, total count stays 44.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200 rounded">Step 3</span>
            <div>
              <p className="font-semibold text-slate-900">Apply Manual Route Correction</p>
              <p className="text-slate-500">Open M07 or C01 in Inbox, assign custom route (e.g. Deal Next Steps), and save.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200 rounded">Step 4</span>
            <div>
              <p className="font-semibold text-slate-900">Import Update Batch (02_update.json)</p>
              <p className="text-slate-500">M07 updates to revision 2 with 27 turns. Total records stays 44. Usable transcripts increases to 18.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200 rounded">Step 5</span>
            <div>
              <p className="font-semibold text-slate-900">Refresh & Verify Override Persistence</p>
              <p className="text-slate-500">Browser refresh or app restart confirms manager manual route override survived the update.</p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5 p-2.5 bg-slate-50 rounded-lg">
            <span className="font-bold text-slate-900 px-1.5 py-0.5 bg-slate-200 rounded">Step 6</span>
            <div>
              <p className="font-semibold text-slate-900">Generate & Download Export Manifest</p>
              <p className="text-slate-500">Generates physical manifest.json, manifest.csv, conversation folders, and ZIP archive.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Import Audit Trail History</h2>
          <span className="text-xs text-slate-500 font-mono">{history.length} Runs Logged</span>
        </div>

        {history.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No import runs recorded yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="p-3">Run ID</th>
                  <th className="p-3">Batch ID</th>
                  <th className="p-3">Batch Type</th>
                  <th className="p-3">Revision</th>
                  <th className="p-3 text-right">Processed</th>
                  <th className="p-3 text-right">Created</th>
                  <th className="p-3 text-right">Updated</th>
                  <th className="p-3 text-right">Duplicates Prevented</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-medium">#{run.id}</td>
                    <td className="p-3 font-mono">{run.batch_id}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize font-medium">
                        {run.batch_type}
                      </span>
                    </td>
                    <td className="p-3 font-mono">Rev {run.revision}</td>
                    <td className="p-3 text-right font-medium">{run.records_processed}</td>
                    <td className="p-3 text-right text-emerald-700 font-bold">{run.records_created}</td>
                    <td className="p-3 text-right text-indigo-700 font-bold">{run.records_updated}</td>
                    <td className="p-3 text-right text-amber-700 font-bold">{run.duplicates_prevented}</td>
                    <td className="p-3 text-slate-500">{run.completed_at.replace('T', ' ').substring(0, 19)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
