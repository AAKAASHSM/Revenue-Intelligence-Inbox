import React from 'react';
import { LayoutDashboard, Inbox, FileText, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'inbox' | 'brief' | 'import-replay';
  onSelectTab: (tab: 'dashboard' | 'inbox' | 'brief' | 'import-replay') => void;
  recordCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab, recordCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Context */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                RI
              </div>
              <div>
                <span className="text-base font-semibold text-slate-900 tracking-tight">Revenue Intelligence Inbox</span>
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <span>21 Aug 2026</span>
                  <span>•</span>
                  <span>Asia/Kolkata</span>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <nav className="flex space-x-1">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'dashboard'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('inbox')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'inbox'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
              {recordCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-slate-200 text-slate-700">
                  {recordCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('brief')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'brief'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Manager Brief</span>
            </button>

            <button
              onClick={() => onSelectTab('import-replay')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-sm font-medium transition-colors ${
                currentTab === 'import-replay'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Import & Export</span>
            </button>
          </nav>

          {/* Status Badge */}
          <div className="hidden md:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Database Connected
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
