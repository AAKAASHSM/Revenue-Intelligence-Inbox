import React, { useEffect, useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  ExternalLink,
  Target
} from 'lucide-react';
import { ManagerBriefResponse } from '../types';
import { fetchManagerBrief } from '../api';

interface ManagerBriefViewProps {
  onSelectRecord: (source_type: string, source_id: string) => void;
}

export const ManagerBriefView: React.FC<ManagerBriefViewProps> = ({ onSelectRecord }) => {
  const [brief, setBrief] = useState<ManagerBriefResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchManagerBrief()
      .then(setBrief)
      .catch(err => console.error('Failed to load manager brief:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
        Synthesizing manager brief...
      </div>
    );
  }

  if (!brief) {
    return (
      <div className="py-20 text-center text-slate-500">
        Failed to load brief data from backend.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Executive Daily Briefing</span>
          <span>•</span>
          <span>{brief.date} ({brief.timezone})</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Daily Revenue Intelligence Synthesis
        </h1>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-4">
          {brief.overview}
        </p>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 font-medium">Selected Interactions</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{brief.key_metrics.total_records} Records</p>
          <span className="text-xs text-slate-400">{brief.key_metrics.calls_total} Calls, {brief.key_metrics.meetings_total} Meetings</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 font-medium">Verified Transcripts</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{brief.key_metrics.usable_transcripts} Conversations</p>
          <span className="text-xs text-slate-400">Coverage: {brief.key_metrics.transcript_coverage}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 font-medium">Manual Overrides</span>
          <p className="text-xl font-bold text-amber-700 mt-1">{brief.key_metrics.manual_corrections} Overrides</p>
          <span className="text-xs text-slate-400">Preserved across imports</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <span className="text-xs text-slate-500 font-medium">Review Needed</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{brief.key_metrics.needs_review_count} Items</p>
          <span className="text-xs text-slate-400">Pending manager check</span>
        </div>
      </div>

      {/* High-Impact Conversations */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Target className="w-5 h-5 text-slate-900" />
          <h2 className="text-base font-bold text-slate-900">Critical Verified Conversations</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {brief.critical_conversations.map((c) => (
            <div
              key={c.source_id}
              onClick={() => onSelectRecord(c.record_ref.startsWith('M') ? 'meeting' : 'call', c.source_id)}
              className="p-4 border border-slate-200 rounded-lg hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-all space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold px-2 py-0.5 bg-slate-900 text-white rounded">
                  {c.record_ref}
                </span>
                <span className="font-semibold text-slate-900 text-sm truncate">{c.company_topic}</span>
              </div>
              <p className="text-slate-600 leading-relaxed">{c.impact}</p>
              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-slate-500">
                <span className="italic truncate max-w-[260px]">{c.evidence_cite}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Coaching Observations */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Lightbulb className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">Practical Sales Coaching Insights</h2>
        </div>

        <div className="space-y-3">
          {brief.coaching_observations.map((co, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5">
              <h3 className="font-bold text-slate-900 text-sm">{co.area}</h3>
              <p className="text-slate-700 leading-relaxed">{co.observation}</p>
              <p className="text-slate-500 font-mono text-[11px] pt-1">
                Citation: {co.evidence_cite}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Follow-up Priorities */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Follow-Up Action Items</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {brief.follow_up_priorities.map((fp, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 rounded font-semibold ${
                  fp.priority.includes('P0') ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {fp.priority}
                </span>
                <span className="font-medium text-slate-900">{fp.item}</span>
              </div>
              <span className="text-slate-500 font-semibold bg-slate-100 px-2 py-1 rounded">
                {fp.target}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence Boundaries / Anti-Hallucination Disclosures */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-2 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Evidence Boundaries & Integrity Disclosures</span>
        </div>
        <p className="text-slate-500">
          The conclusions above are strictly grounded in supplied audio transcripts and metadata. The following boundaries are explicitly maintained:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-600 pl-2">
          {brief.unsupported_boundaries.map((b, idx) => (
            <li key={idx}>{b}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
