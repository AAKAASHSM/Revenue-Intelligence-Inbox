import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Bot,
  UserCheck,
  RotateCw,
  ExternalLink,
  ShieldAlert,
  Save,
  Clock,
  User
} from 'lucide-react';
import { RecordDetail } from '../types';
import { updateRoute, reanalyzeRecord } from '../api';

interface ConversationDetailProps {
  record: RecordDetail;
  onBack: () => void;
  onRefreshRecord: () => void;
}

const AVAILABLE_ROUTES = [
  'customer_follow_up',
  'deal_next_steps',
  'sales_coaching',
  'internal_vendor_note',
  'needs_human_review'
];

export const ConversationDetail: React.FC<ConversationDetailProps> = ({
  record,
  onBack,
  onRefreshRecord
}) => {
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(record.current_routes);
  const [isSavingRoute, setIsSavingRoute] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [highlightedTurn, setHighlightedTurn] = useState<number | null>(null);

  const turnRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const handleToggleRoute = (route: string) => {
    setSelectedRoutes(prev =>
      prev.includes(route) ? prev.filter(r => r !== route) : [...prev, route]
    );
  };

  const handleSaveRouteCorrection = async () => {
    try {
      setIsSavingRoute(true);
      await updateRoute(record.id, selectedRoutes, 'Manager manual route adjustment');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onRefreshRecord();
    } catch (err) {
      alert('Failed to save route correction: ' + String(err));
    } finally {
      setIsSavingRoute(false);
    }
  };

  const handleRunAiAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      await reanalyzeRecord(record.id, true);
      onRefreshRecord();
    } catch (err) {
      alert('AI Analysis encountered an error. Falling back to precomputed verification: ' + String(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scrollToTurn = (turnNum: number | null) => {
    if (!turnNum) return;
    setHighlightedTurn(turnNum);
    const element = turnRefs.current[turnNum];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Remove highlight after 4 seconds
    setTimeout(() => {
      setHighlightedTurn(null);
    }, 4000);
  };

  const analysis = record.analysis?.data;
  const analysisMeta = record.analysis;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Navigation & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-sm font-bold px-2.5 py-0.5 bg-slate-900 text-white rounded">
                {record.record_ref || record.source_id.substring(0, 8)}
              </span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-500">
                {record.source_type}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-mono text-slate-500">{record.source_id}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-1">
              {record.metadata?.title || `${record.person || 'Unknown'} - ${record.source_type.toUpperCase()}`}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 self-end sm:self-center">
          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzing || !record.transcript_available}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shadow-sm transition-all ${
              !record.transcript_available
                ? 'opacity-50 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 text-indigo-500 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing with Gemini...' : 'Re-run Gemini Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Metadata Pill Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
        <div>
          <span className="text-slate-400 block font-medium uppercase tracking-wider">Account / Person</span>
          <span className="font-semibold text-slate-900 truncate block mt-0.5">{record.person || 'Unassigned'}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase tracking-wider">Timestamp</span>
          <span className="font-semibold text-slate-900 block mt-0.5">{record.started_at?.replace('T', ' ').substring(0, 16) || '2026-08-21'}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase tracking-wider">Duration</span>
          <span className="font-semibold text-slate-900 block mt-0.5">
            {Math.floor(record.duration_seconds / 60)}m {Math.round(record.duration_seconds % 60)}s
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase tracking-wider">Revision</span>
          <span className="font-semibold text-slate-900 block mt-0.5 font-mono">Revision {record.applied_revision}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase tracking-wider">Transcript</span>
          <span className={`font-semibold block mt-0.5 ${record.transcript_available ? 'text-emerald-700' : 'text-slate-500'}`}>
            {record.transcript_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium uppercase tracking-wider">Review Status</span>
          <span className={`font-semibold block mt-0.5 capitalize ${
            record.review_status === 'needs_review' ? 'text-amber-700' : 'text-emerald-700'
          }`}>
            {record.review_status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Route Management & Manual Override Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Routing & Manager Decision</h2>
            <p className="text-xs text-slate-500">
              Distinguish between automated AI recommendation and final manager routing decision.
            </p>
          </div>
          {record.is_manually_corrected && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Manual Decision Active</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: AI Suggested vs Current */}
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-500 block">AI Suggested Route(s):</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {record.ai_suggested_routes.length > 0 ? (
                  record.ai_suggested_routes.map(r => (
                    <span key={r} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">
                      {r.replace(/_/g, ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">None suggested</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">Current Active Route(s):</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {record.current_routes.map(r => (
                  <span key={r} className="px-2 py-0.5 bg-slate-900 text-white rounded font-medium">
                    {r.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Manual Route Modifier */}
          <div className="space-y-3">
            <span className="text-xs font-medium text-slate-700 block">Modify Assigned Route(s):</span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROUTES.map(rt => {
                const isSelected = selectedRoutes.includes(rt);
                return (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => handleToggleRoute(rt)}
                    className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {rt.replace(/_/g, ' ')}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center space-x-3 pt-1">
              <button
                type="button"
                onClick={handleSaveRouteCorrection}
                disabled={isSavingRoute}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingRoute ? 'Saving...' : 'Save Correction'}</span>
              </button>
              {saveSuccess && (
                <span className="text-xs text-emerald-600 font-medium animate-fade-in flex items-center space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Manual correction preserved</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: LEFT TRANSCRIPT | RIGHT INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Transcript Viewer (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-[750px]">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Transcript Viewer</h2>
              <p className="text-xs text-slate-500">Identifiable verbatim speaker turns</p>
            </div>
            {record.transcript?.turns && (
              <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                {record.transcript.turns.length} Turns
              </span>
            )}
          </div>

          <div className="p-4 overflow-y-auto flex-1 space-y-3 font-sans">
            {!record.transcript_available ? (
              <div className="py-20 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No usable transcript supplied</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  {record.transcript?.unavailable_reason || 'This background call or meeting contains no recorded dialogue in the current dataset.'}
                </p>
              </div>
            ) : record.transcript?.turns && record.transcript.turns.length > 0 ? (
              record.transcript.turns.map((t) => {
                const isSelected = highlightedTurn === t.turn;
                return (
                  <div
                    key={t.turn}
                    ref={(el) => (turnRefs.current[t.turn] = el)}
                    className={`p-3.5 rounded-lg border text-sm transition-all ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 shadow-sm ring-2 ring-amber-300'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 text-xs text-slate-400">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-700">Turn {t.turn}</span>
                        {t.speaker && (
                          <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                            {t.speaker}
                          </span>
                        )}
                      </div>
                      {t.timecode && (
                        <span className="font-mono text-slate-400">{t.timecode}</span>
                      )}
                    </div>
                    <p className="text-slate-800 leading-relaxed">{t.text}</p>
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-700 whitespace-pre-line">
                {record.transcript?.content}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Intelligence Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Analysis Header Badge */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Bot className="w-4 h-4 text-slate-700" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Intelligence & Evidence</h2>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium border ${
                analysisMeta?.generated_by === 'ai'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                {analysisMeta?.generated_by === 'ai' ? 'Gemini 1.5 Flash' : 'Pre-generated Verified'}
              </span>
            </div>

            {analysis ? (
              <div className="space-y-4 text-sm">
                {/* 1. Summary */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. What Happened</h3>
                  <p className="text-slate-900 mt-1 leading-relaxed text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {analysis.summary}
                  </p>
                </div>

                {/* 2. Why It Matters */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Why It Matters</h3>
                  <p className="text-slate-900 mt-1 leading-relaxed text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {analysis.why_it_matters}
                  </p>
                </div>

                {/* 3. Evidence Quotes */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">3. Supporting Evidence</h3>
                  <div className="space-y-2 mt-1">
                    {analysis.evidence.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No specific quotes captured</p>
                    ) : (
                      analysis.evidence.map((ev, idx) => (
                        <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-700">
                              {ev.turn ? `Turn ${ev.turn}` : 'Passage'}
                            </span>
                            {ev.turn && (
                              <button
                                type="button"
                                onClick={() => scrollToTurn(ev.turn)}
                                className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-2 py-0.5 rounded shadow-2xs hover:bg-indigo-50 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View Evidence</span>
                              </button>
                            )}
                          </div>
                          <blockquote className="border-l-2 border-indigo-500 pl-2 italic text-slate-800">
                            "{ev.quote}"
                          </blockquote>
                          <p className="text-slate-500">{ev.reason}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 4. What Evidence Does NOT Establish */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                    <span>4. What Evidence Does NOT Establish</span>
                  </h3>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-xs text-slate-600 bg-amber-50/50 border border-amber-200/60 p-2.5 rounded-lg">
                    {analysis.not_established.map((ne, idx) => (
                      <li key={idx}>{ne}</li>
                    ))}
                  </ul>
                </div>

                {/* 5. Recommended Actions */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">5. Recommended Actions</h3>
                  <div className="space-y-1.5 mt-1 text-xs">
                    {analysis.recommended_actions.map((act, idx) => (
                      <div key={idx} className="flex items-start space-x-2 bg-slate-50 p-2 rounded border border-slate-100">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-slate-800 font-medium">{act.action}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            Owner: <span className="font-semibold text-slate-700">{act.owner || 'Unassigned / Not Verified'}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Analysis unavailable</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
