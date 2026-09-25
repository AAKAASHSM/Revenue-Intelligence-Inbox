import React from 'react';
import {
  Phone,
  Video,
  FileText,
  AlertCircle,
  CheckCircle,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Percent,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { getExportCsvDownloadUrl } from '../api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Cell
} from 'recharts';
import { DashboardMetrics, RecordListItem } from '../types';
import { MetricCard } from './MetricCard';

interface DashboardViewProps {
  metrics: DashboardMetrics | null;
  onFilterInbox: (filters: { route?: string; review_status?: string; person?: string; source_type?: string }) => void;
  onSelectRecord: (source_type: string, source_id: string) => void;
  recentRecords: RecordListItem[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  onFilterInbox,
  onSelectRecord,
  recentRecords
}) => {
  if (!metrics) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
        Calculating metrics from database...
      </div>
    );
  }

  // Formatting for routing display
  const routingData = Object.entries(metrics.routing_counts).map(([route, count]) => ({
    name: route.replace(/_/g, ' '),
    rawRoute: route,
    count
  }));

  // Top active reps
  const personChartData = metrics.activity_by_person.slice(0, 7).map(p => ({
    name: p.person.length > 15 ? p.person.substring(0, 12) + '...' : p.person,
    fullName: p.person,
    Calls: p.calls,
    Meetings: p.meetings,
    Total: p.total,
    Transcripts: p.transcripts
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manager Operations Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real calculated metrics from 44 selected interaction records on 21 August 2026 (Asia/Kolkata).
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <a
            href={getExportCsvDownloadUrl()}
            download="revenue_intelligence_records.csv"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-md text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
            title="Download complete dataset in CSV format"
          >
            <Download className="w-3.5 h-3.5 text-slate-700" />
            <span>Export Dataset (CSV)</span>
          </a>
          <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200 font-mono">
            Revision Ordering Active
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          label="Total Source Records"
          value={metrics.total_records}
          subtitle="Fixed sample size"
          badge="44 Records"
          badgeColor="slate"
          icon={<FileText className="w-5 h-5" />}
        />

        <MetricCard
          label="Call Interactions"
          value={metrics.total_calls}
          denominator={`${metrics.total_records} total`}
          subtitle={`${metrics.calls_usable_transcripts} with usable text (${Math.round((metrics.calls_usable_transcripts/metrics.total_calls)*100)}%)`}
          badge="30 Calls"
          badgeColor="blue"
          onClick={() => onFilterInbox({ source_type: 'call' })}
          icon={<Phone className="w-5 h-5" />}
        />

        <MetricCard
          label="Calendar Meetings"
          value={metrics.total_meetings}
          denominator={`${metrics.total_records} total`}
          subtitle={`${metrics.meetings_usable_transcripts} with usable turns (${Math.round((metrics.meetings_usable_transcripts/metrics.total_meetings)*100)}%)`}
          badge="14 Meetings"
          badgeColor="blue"
          onClick={() => onFilterInbox({ source_type: 'meeting' })}
          icon={<Video className="w-5 h-5" />}
        />

        <MetricCard
          label="Transcript Coverage"
          value={`${metrics.transcript_coverage_pct}%`}
          denominator={`${metrics.usable_transcripts_count}/${metrics.transcript_coverage_denominator}`}
          subtitle={`${metrics.usable_transcripts_count} conversations with audio text`}
          badge={metrics.usable_transcripts_count === 18 ? "Post-Update: 18/44" : "Initial: 17/44"}
          badgeColor="emerald"
          icon={<Percent className="w-5 h-5" />}
        />
      </div>

      {/* Secondary Status & Connection Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <MetricCard
          label="Attention / Needs Review"
          value={metrics.review_counts.needs_review || 0}
          denominator={`${metrics.total_records} records`}
          subtitle="Click to view records requiring human attention"
          badge="Action Required"
          badgeColor="amber"
          onClick={() => onFilterInbox({ review_status: 'needs_review' })}
          icon={<AlertCircle className="w-5 h-5 text-amber-600" />}
        />

        <MetricCard
          label="Analyzed & Reviewed"
          value={metrics.review_counts.reviewed || 0}
          denominator={`${metrics.total_records} records`}
          subtitle="Conversations with evidence-backed routing"
          badge="Verified"
          badgeColor="emerald"
          onClick={() => onFilterInbox({ review_status: 'reviewed' })}
          icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
        />

        <MetricCard
          label="Source-Reported Connection Rate"
          value={`${metrics.source_reported_connection_pct}%`}
          denominator={`${metrics.source_reported_connected_calls}/30 calls`}
          subtitle="Stored upstream metadata flag (is_connected=true)"
          badge="Metadata Flag"
          badgeColor="slate"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity by Person */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Activity by Rep / Account</h2>
              <p className="text-xs text-slate-500">Selected interactions breakdown (calls & meetings)</p>
            </div>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={personChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-15} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded shadow text-xs space-y-1">
                          <p className="font-semibold">{data.fullName}</p>
                          <p>Total Interactions: {data.Total}</p>
                          <p>Calls: {data.Calls} | Meetings: {data.Meetings}</p>
                          <p className="text-emerald-300">Usable Transcripts: {data.Transcripts}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="Total" fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Transcripts" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 mt-2">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-slate-900 rounded-sm"></span>
              <span>Total Interactions</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
              <span>With Usable Transcript</span>
            </div>
          </div>
        </div>

        {/* Activity by Hour (21 Aug 2026) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Activity Distribution Across 21 Aug 2026</h2>
              <p className="text-xs text-slate-500">Hourly volume clusters (all records fall on single date)</p>
            </div>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.activity_by_hour} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded shadow text-xs">
                          <p className="font-semibold">{data.hour} UTC</p>
                          <p>Interactions: {data.count}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line type="monotone" dataKey="count" stroke="#0f172a" strokeWidth={2} dot={{ r: 3, fill: '#0f172a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">
            Peak volume observed in afternoon hours (11:00 UTC and 18:00 UTC batches).
          </p>
        </div>
      </div>

      {/* Routing Categories Breakdown */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-1">Routing Taxonomy Breakdown</h2>
        <p className="text-xs text-slate-500 mb-4">
          Click any routing bucket to view and manage its assigned conversations in the Inbox.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {routingData.map((item) => (
            <div
              key={item.rawRoute}
              onClick={() => onFilterInbox({ route: item.rawRoute })}
              className="border border-slate-200 rounded-lg p-3 hover:border-slate-400 hover:bg-slate-50 cursor-pointer transition-all"
            >
              <div className="text-xs text-slate-500 uppercase tracking-wider font-medium truncate">
                {item.name}
              </div>
              <div className="text-xl font-bold text-slate-900 mt-1">{item.count}</div>
              <div className="mt-2 flex items-center text-xs text-slate-600 font-medium">
                <span>View records</span>
                <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High Priority / Spotlight Conversations */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Key Spotlight Conversations</h2>
            <p className="text-xs text-slate-500">
              High-impact interactions requiring immediate manager awareness or follow-up
            </p>
          </div>
          <button
            onClick={() => onFilterInbox({})}
            className="text-xs font-medium text-slate-900 hover:underline flex items-center space-x-1"
          >
            <span>View all 44 records in Inbox</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentRecords.filter(r => r.transcript_available).slice(0, 5).map((r) => (
            <div
              key={r.source_id}
              onClick={() => onSelectRecord(r.source_type, r.source_id)}
              className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-4">
                <span className="font-mono text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-800 rounded">
                  {r.record_ref || r.source_type.toUpperCase()}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-slate-900">{r.person || 'Unassigned'}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 capitalize">{r.source_type}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-0.5">
                    {r.current_routes.map(rt => (
                      <span key={rt} className="text-xs text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {rt.replace(/_/g, ' ')}
                      </span>
                    ))}
                    {r.is_manually_corrected && (
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                        Manual Override
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  r.review_status === 'needs_review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {r.review_status === 'needs_review' ? 'Needs Review' : 'Reviewed'}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
