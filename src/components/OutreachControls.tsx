import React from 'react';
import { Search, X, Filter, ArrowUpDown, CheckCircle2, Building2 } from 'lucide-react';
import { Consultancy, OutreachRecord } from '../data/consultancies';

interface OutreachControlsProps {
  consultancies: Consultancy[];
  records: Record<number, OutreachRecord>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (p: string) => void;
  districtFilter: string;
  onDistrictFilterChange: (d: string) => void;
  statusFilter: 'all' | 'pending' | 'completed';
  onStatusFilterChange: (s: 'all' | 'pending' | 'completed') => void;
  sortBy: 'priority' | 'rating' | 'reviews' | 'name';
  onSortByChange: (sort: 'priority' | 'rating' | 'reviews' | 'name') => void;
  onResetFilters: () => void;
}

export const OutreachControls: React.FC<OutreachControlsProps> = ({
  consultancies,
  records,
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  districtFilter,
  onDistrictFilterChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  onResetFilters,
}) => {
  const totalCount = consultancies.length;
  const completedCount = consultancies.filter((c) => records[c.id]?.completed).length;
  const highPriorityTotal = consultancies.filter((c) => c.priority === 'High').length;
  const highPriorityDone = consultancies.filter((c) => c.priority === 'High' && records[c.id]?.completed).length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  const districts = ['All', 'Malappuram', 'Ernakulam', 'Kozhikode', 'Thrissur'];

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    priorityFilter !== 'all' ||
    districtFilter !== 'all' ||
    statusFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Overview Stat Cards & Progress Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Outreach Progress</span>
              <span className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 tabular-nums">
                {completedCount} of {totalCount} Contacted ({progressPercent}%)
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Source: Google Maps listings for Kerala study abroad consultancies
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 mr-1.5">High Priority:</span>
              <span className="font-semibold text-slate-900 tabular-nums font-mono">
                {highPriorityDone}/{highPriorityTotal}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
              <span className="text-slate-500 mr-1.5">Remaining:</span>
              <span className="font-semibold text-amber-700 tabular-nums font-mono">
                {totalCount - completedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Search Input Bar (Thumb-friendly with clear action) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by consultancy, town, district, phone..."
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-slate-200 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 min-w-[40px] justify-center"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col gap-2.5">
        {/* Priority Filter Tabs (Functional segmented controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
            Priority:
          </span>
          {[
            { id: 'all', label: 'All (20)' },
            { id: 'High', label: 'High (6)' },
            { id: 'Medium', label: 'Medium (10)' },
            { id: 'Low', label: 'Low (4)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onPriorityFilterChange(tab.id)}
              className={`min-h-[36px] px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 border ${
                priorityFilter === tab.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* District & Status Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onStatusFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'pending'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({totalCount - completedCount})
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('completed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                statusFilter === 'completed'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contacted ({completedCount})
            </button>
          </div>

          {/* District Filter & Sort Selectors */}
          <div className="flex items-center gap-2">
            {/* District Select */}
            <select
              aria-label="Filter by district"
              value={districtFilter}
              onChange={(e) => onDistrictFilterChange(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Districts</option>
              <option value="Malappuram">Malappuram (6)</option>
              <option value="Ernakulam">Ernakulam (5)</option>
              <option value="Kozhikode">Kozhikode (7)</option>
              <option value="Thrissur">Thrissur (2)</option>
            </select>

            {/* Sort Order Select */}
            <select
              aria-label="Sort consultancies"
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="priority">Sort: Priority Order (#1-#20)</option>
              <option value="rating">Sort: Google Rating</option>
              <option value="reviews">Sort: Review Count</option>
              <option value="name">Sort: Name (A-Z)</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={onResetFilters}
                className="text-xs font-medium text-emerald-700 hover:underline px-1.5 whitespace-nowrap"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
