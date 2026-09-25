import React, { useState } from 'react';
import {
  Search,
  Filter,
  Phone,
  Video,
  AlertCircle,
  CheckCircle,
  FileQuestion,
  UserCheck,
  ArrowRight,
  RotateCcw,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { RecordListItem } from '../types';
import { getFilteredRecordsCsvDownloadUrl } from '../api';

interface InboxViewProps {
  records: RecordListItem[];
  onSelectRecord: (source_type: string, source_id: string) => void;
  selectedPerson?: string;
  selectedSourceType?: string;
  selectedRoute?: string;
  selectedReviewStatus?: string;
}

export const InboxView: React.FC<InboxViewProps> = ({
  records,
  onSelectRecord,
  selectedPerson: initialPerson,
  selectedSourceType: initialSourceType,
  selectedRoute: initialRoute,
  selectedReviewStatus: initialReviewStatus
}) => {
  const [search, setSearch] = useState('');
  const [personFilter, setPersonFilter] = useState<string>(initialPerson || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(initialSourceType || 'all');
  const [routeFilter, setRouteFilter] = useState<string>(initialRoute || 'all');
  const [reviewFilter, setReviewFilter] = useState<string>(initialReviewStatus || 'all');
  const [transcriptFilter, setTranscriptFilter] = useState<string>('all');

  // Extract distinct values for filters
  const uniquePersons = Array.from(new Set(records.map(r => r.person).filter(Boolean))).sort() as string[];

  // Filter records
  const filteredRecords = records.filter(r => {
    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRef = r.record_ref?.toLowerCase().includes(q);
      const matchId = r.source_id.toLowerCase().includes(q);
      const matchPerson = r.person?.toLowerCase().includes(q);
      const matchRoute = r.current_routes.some(rt => rt.toLowerCase().includes(q));
      if (!matchRef && !matchId && !matchPerson && !matchRoute) return false;
    }

    // Person
    if (personFilter !== 'all' && r.person !== personFilter) return false;

    // Type
    if (typeFilter !== 'all' && r.source_type !== typeFilter) return false;

    // Route
    if (routeFilter !== 'all') {
      if (routeFilter === 'unassigned') {
        if (r.current_routes.length > 0) return false;
      } else {
        if (!r.current_routes.includes(routeFilter)) return false;
      }
    }

    // Review status
    if (reviewFilter !== 'all' && r.review_status !== reviewFilter) return false;

    // Transcript available
    if (transcriptFilter === 'available' && !r.transcript_available) return false;
    if (transcriptFilter === 'unavailable' && r.transcript_available) return false;

    return true;
  });

  const resetFilters = () => {
    setSearch('');
    setPersonFilter('all');
    setTypeFilter('all');
    setRouteFilter('all');
    setReviewFilter('all');
    setTranscriptFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Conversation Inbox</h1>
          <p className="mt-1 text-sm text-slate-500">
            Showing {filteredRecords.length} of {records.length} interactions from supplied dataset
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={getFilteredRecordsCsvDownloadUrl({
              person: personFilter,
              source_type: typeFilter,
              route: routeFilter,
              review_status: reviewFilter,
              has_transcript: transcriptFilter === 'available' ? true : transcriptFilter === 'unavailable' ? false : undefined,
              search: search
            })}
            download="revenue_intelligence_records.csv"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            title="Download current filtered table to CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV ({filteredRecords.length})</span>
          </a>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ref (e.g. M07, C01), person, or route..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Source Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Types</option>
              <option value="call">Calls Only (30)</option>
              <option value="meeting">Meetings Only (14)</option>
            </select>

            {/* Person Filter */}
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 max-w-[180px]"
            >
              <option value="all">All People</option>
              {uniquePersons.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {/* Route Filter */}
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Routes</option>
              <option value="customer_follow_up">Customer Follow-up</option>
              <option value="deal_next_steps">Deal Next Steps</option>
              <option value="sales_coaching">Sales Coaching</option>
              <option value="internal_vendor_note">Internal Vendor Note</option>
              <option value="needs_human_review">Needs Human Review</option>
              <option value="unassigned">Unassigned</option>
            </select>

            {/* Review Status Filter */}
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">All Review States</option>
              <option value="needs_review">Needs Review</option>
              <option value="reviewed">Reviewed</option>
              <option value="no_transcript">No Transcript</option>
            </select>

            {/* Transcript Filter */}
            <select
              value={transcriptFilter}
              onChange={(e) => setTranscriptFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Transcript: All</option>
              <option value="available">Transcript Available</option>
              <option value="unavailable">No Usable Transcript</option>
            </select>

            {(search || personFilter !== 'all' || typeFilter !== 'all' || routeFilter !== 'all' || reviewFilter !== 'all' || transcriptFilter !== 'all') && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conversation List / Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FileQuestion className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-base font-medium text-slate-900">No matching conversations found</p>
            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRecords.map((r) => {
              const formattedDuration = `${Math.floor(r.duration_seconds / 60)}m ${Math.round(r.duration_seconds % 60)}s`;

              return (
                <div
                  key={r.source_id}
                  onClick={() => onSelectRecord(r.source_type, r.source_id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer space-y-3 sm:space-y-0"
                >
                  {/* Left: Identification & Metadata */}
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 flex-shrink-0">
                      {r.source_type === 'call' ? (
                        <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
                          <Phone className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
                          <Video className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded">
                          {r.record_ref || r.source_id.substring(0, 8)}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          {r.source_type}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs font-mono text-slate-500 truncate max-w-[150px] sm:max-w-none">
                          {r.source_id}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-slate-900">{r.person || 'Unassigned Account'}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{r.started_at?.replace('T', ' ').substring(0, 16) || '2026-08-21'}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-500">{formattedDuration}</span>
                      </div>

                      {/* Routes & Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {r.current_routes.length > 0 ? (
                          r.current_routes.map((rt) => (
                            <span
                              key={rt}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                            >
                              {rt.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-400 border border-slate-200">
                            Unassigned
                          </span>
                        )}

                        {r.is_manually_corrected && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <UserCheck className="w-3 h-3" />
                            <span>Manual Override</span>
                          </span>
                        )}

                        {r.attention_flag && (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>{r.attention_flag}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Transcript Status, Review State, and Action */}
                  <div className="flex items-center space-x-4 sm:space-x-6 self-end sm:self-center">
                    {/* Transcript badge */}
                    <div className="text-right">
                      {r.transcript_available ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Transcript Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                          No Usable Text
                        </span>
                      )}
                    </div>

                    {/* Review State Badge */}
                    <div>
                      {r.review_status === 'needs_review' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertCircle className="w-3 h-3" />
                          <span>Needs Review</span>
                        </span>
                      ) : r.review_status === 'reviewed' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" />
                          <span>Reviewed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          No Audio
                        </span>
                      )}
                    </div>

                    {/* Open Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(r.source_type, r.source_id);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
