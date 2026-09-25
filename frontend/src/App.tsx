import React, { useState, useEffect } from 'react';
import { DashboardMetrics, RecordListItem, RecordDetail } from './types';
import { fetchDashboard, fetchRecords, fetchRecordDetail } from './api';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InboxView } from './components/InboxView';
import { ConversationDetail } from './components/ConversationDetail';
import { ManagerBriefView } from './components/ManagerBriefView';
import { ImportReplayView } from './components/ImportReplayView';

export function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'inbox' | 'brief' | 'import-replay'>('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [records, setRecords] = useState<RecordListItem[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<RecordDetail | null>(null);
  const [inboxFilters, setInboxFilters] = useState<{
    route?: string;
    review_status?: string;
    person?: string;
    source_type?: string;
  }>({});

  const refreshAllData = async () => {
    try {
      const [m, recs] = await Promise.all([fetchDashboard(), fetchRecords()]);
      setMetrics(m);
      setRecords(recs);

      // If a record is currently open, refresh its detail too
      if (selectedRecord) {
        const updatedDetail = await fetchRecordDetail(selectedRecord.source_type, selectedRecord.source_id);
        setSelectedRecord(updatedDetail);
      }
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const handleSelectRecord = async (source_type: string, source_id: string) => {
    try {
      const detail = await fetchRecordDetail(source_type, source_id);
      setSelectedRecord(detail);
    } catch (err) {
      alert('Failed to load record details: ' + String(err));
    }
  };

  const handleFilterInbox = (filters: { route?: string; review_status?: string; person?: string; source_type?: string }) => {
    setInboxFilters(filters);
    setSelectedRecord(null);
    setCurrentTab('inbox');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedRecord(null);
          setCurrentTab(tab);
        }}
        recordCount={records.length}
      />

      <main className="flex-1 pb-16">
        {selectedRecord ? (
          <ConversationDetail
            record={selectedRecord}
            onBack={() => setSelectedRecord(null)}
            onRefreshRecord={refreshAllData}
          />
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <DashboardView
                metrics={metrics}
                onFilterInbox={handleFilterInbox}
                onSelectRecord={handleSelectRecord}
                recentRecords={records}
              />
            )}

            {currentTab === 'inbox' && (
              <InboxView
                records={records}
                onSelectRecord={handleSelectRecord}
                selectedPerson={inboxFilters.person}
                selectedSourceType={inboxFilters.source_type}
                selectedRoute={inboxFilters.route}
                selectedReviewStatus={inboxFilters.review_status}
              />
            )}

            {currentTab === 'brief' && (
              <ManagerBriefView
                onSelectRecord={(st, sid) => {
                  handleSelectRecord(st, sid);
                }}
              />
            )}

            {currentTab === 'import-replay' && (
              <ImportReplayView onRefreshAll={refreshAllData} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        <p>Revenue Intelligence Inbox • Grounded Sales Intelligence • Volopay Assessment</p>
      </footer>
    </div>
  );
}

export default App;
