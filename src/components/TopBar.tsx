import React from 'react';
import { Download, CheckCircle2, RotateCcw } from 'lucide-react';

interface TopBarProps {
  onExportCSV: () => void;
  onResetConfirm: () => void;
  activeNavTab: string;
  onSelectNavTab: (tab: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onExportCSV,
  onResetConfirm,
  activeNavTab,
  onSelectNavTab,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-2 shrink-0">
        <a href="/" className="text-base sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
          Kerala Outreach
        </a>
      </div>

      {/* Zone 2: 4 clean single-line navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          type="button"
          onClick={() => onSelectNavTab('all')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            activeNavTab === 'all' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          All Consultancies
        </button>
        <button
          type="button"
          onClick={() => onSelectNavTab('high')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            activeNavTab === 'high' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          High Priority
        </button>
        <button
          type="button"
          onClick={() => onSelectNavTab('pending')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            activeNavTab === 'pending' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          To Contact
        </button>
        <button
          type="button"
          onClick={() => onSelectNavTab('contacted')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap cursor-pointer ${
            activeNavTab === 'contacted' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Completed
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onExportCSV}
          className="min-h-[38px] px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-xl transition-all shadow-xs flex items-center gap-1.5 whitespace-nowrap"
          title="Download updated outreach list as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </header>
  );
};
