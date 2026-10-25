import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_CONSULTANCIES, Consultancy, OutreachRecord } from './data/consultancies';
import { getStoredOutreachRecords, saveOutreachRecords, exportOutreachToCSV } from './utils/storage';
import { ConsultancyCard } from './components/ConsultancyCard';
import { ConsultancyDetailModal } from './components/ConsultancyDetailModal';
import { TopBar } from './components/TopBar';
import { OutreachControls } from './components/OutreachControls';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SearchX, CheckCircle, RotateCcw } from 'lucide-react';

export default function App() {
  const [records, setRecords] = useState<Record<number, OutreachRecord>>(() => getStoredOutreachRecords());
  const [selectedConsultancy, setSelectedConsultancy] = useState<Consultancy | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'rating' | 'reviews' | 'name'>('priority');
  const [activeNavTab, setActiveNavTab] = useState('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showResetDialog, setShowResetDialog] = useState(false);

  // Synchronize records with localStorage whenever updated
  useEffect(() => {
    saveOutreachRecords(records);
  }, [records]);

  // Toast dispatcher
  const addToast = (text: string, type: 'success' | 'info' | 'copy' = 'info') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toggle tick mark (completed / contacted)
  const handleToggleComplete = (id: number) => {
    setRecords((prev) => {
      const current = prev[id] || {
        completed: false,
        status: 'not_contacted',
        contactedOn: '',
        followUpOn: '',
        notes: '',
      };
      const newCompleted = !current.completed;
      const today = new Date().toISOString().split('T')[0];
      return {
        ...prev,
        [id]: {
          ...current,
          completed: newCompleted,
          status: newCompleted ? (current.status === 'not_contacted' ? 'called' : current.status) : 'not_contacted',
          contactedOn: newCompleted && !current.contactedOn ? today : current.contactedOn,
        },
      };
    });
  };

  // Update record details (notes, date, status)
  const handleUpdateRecord = (id: number, updates: Partial<OutreachRecord>) => {
    setRecords((prev) => {
      const current = prev[id] || {
        completed: false,
        status: 'not_contacted',
        contactedOn: '',
        followUpOn: '',
        notes: '',
      };
      return {
        ...prev,
        [id]: {
          ...current,
          ...updates,
        },
      };
    });
  };

  // Top nav tab switcher
  const handleSelectNavTab = (tab: string) => {
    setActiveNavTab(tab);
    if (tab === 'all') {
      setPriorityFilter('all');
      setStatusFilter('all');
    } else if (tab === 'high') {
      setPriorityFilter('High');
      setStatusFilter('all');
    } else if (tab === 'pending') {
      setPriorityFilter('all');
      setStatusFilter('pending');
    } else if (tab === 'contacted') {
      setPriorityFilter('all');
      setStatusFilter('completed');
    }
  };

  // Filtered & sorted consultancies
  const filteredConsultancies = useMemo(() => {
    return INITIAL_CONSULTANCIES.filter((c) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesTown = c.town.toLowerCase().includes(q);
        const matchesDistrict = c.district.toLowerCase().includes(q);
        const matchesCategory = c.category.toLowerCase().includes(q);
        const matchesPhone = c.phone.toLowerCase().includes(q);
        const matchesWhy = c.whyPriority.toLowerCase().includes(q);
        if (!matchesName && !matchesTown && !matchesDistrict && !matchesCategory && !matchesPhone && !matchesWhy) {
          return false;
        }
      }

      // Priority filter
      if (priorityFilter !== 'all' && c.priority !== priorityFilter) {
        return false;
      }

      // District filter
      if (districtFilter !== 'all' && c.district !== districtFilter) {
        return false;
      }

      // Status filter
      const isDone = records[c.id]?.completed;
      if (statusFilter === 'pending' && isDone) {
        return false;
      }
      if (statusFilter === 'completed' && !isDone) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'priority') {
        return a.priorityOrder - b.priorityOrder;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'reviews') {
        return b.reviews - a.reviews;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [searchQuery, priorityFilter, districtFilter, statusFilter, sortBy, records]);

  // Next / Previous step handler in modal
  const handleNavigateDetail = (direction: 'prev' | 'next') => {
    if (!selectedConsultancy) return;
    const currentIndex = filteredConsultancies.findIndex((c) => c.id === selectedConsultancy.id);
    if (currentIndex === -1) return;

    if (direction === 'prev' && currentIndex > 0) {
      setSelectedConsultancy(filteredConsultancies[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < filteredConsultancies.length - 1) {
      setSelectedConsultancy(filteredConsultancies[currentIndex + 1]);
    }
  };

  const selectedIndex = selectedConsultancy
    ? filteredConsultancies.findIndex((c) => c.id === selectedConsultancy.id)
    : -1;

  const handleResetAll = () => {
    const initial: Record<number, OutreachRecord> = {};
    INITIAL_CONSULTANCIES.forEach((c) => {
      initial[c.id] = {
        completed: false,
        status: 'not_contacted',
        contactedOn: '',
        followUpOn: '',
        notes: '',
      };
    });
    setRecords(initial);
    setShowResetDialog(false);
    addToast('Outreach records reset', 'info');
  };

  const handleExportCSV = () => {
    exportOutreachToCSV(records);
    addToast('Downloaded outreach list CSV', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col font-sans selection:bg-emerald-500/20">
      {/* Top Bar following Top Bar Contract */}
      <TopBar
        onExportCSV={handleExportCSV}
        onResetConfirm={() => setShowResetDialog(true)}
        activeNavTab={activeNavTab}
        onSelectNavTab={handleSelectNavTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
        {/* Title & Overview Banner */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Kerala Study Abroad Consultancies
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Outreach list with 20 consultancies, priority rank, one-tap dialing, and progress tracking.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowResetDialog(true)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>

        {/* Filter, Search & Progress Metrics Bar */}
        <OutreachControls
          consultancies={INITIAL_CONSULTANCIES}
          records={records}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityFilter={priorityFilter}
          onPriorityFilterChange={setPriorityFilter}
          districtFilter={districtFilter}
          onDistrictFilterChange={setDistrictFilter}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onResetFilters={() => {
            setSearchQuery('');
            setPriorityFilter('all');
            setDistrictFilter('all');
            setStatusFilter('all');
          }}
        />

        {/* Consultancy Cards Responsive Grid */}
        {filteredConsultancies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredConsultancies.map((consultancy) => {
              const rec = records[consultancy.id] || {
                completed: false,
                status: 'not_contacted',
                contactedOn: '',
                followUpOn: '',
                notes: '',
              };
              return (
                <ConsultancyCard
                  key={consultancy.id}
                  consultancy={consultancy}
                  record={rec}
                  onToggleComplete={handleToggleComplete}
                  onSelect={(c) => setSelectedConsultancy(c)}
                  onToast={addToast}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No consultancies match your search
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, changing priority filters, or resetting filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('all');
                setDistrictFilter('all');
                setStatusFilter('all');
              }}
              className="mt-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </main>

      {/* Floating or Modal Detail Page View */}
      {selectedConsultancy && (
        <ConsultancyDetailModal
          consultancy={selectedConsultancy}
          record={
            records[selectedConsultancy.id] || {
              completed: false,
              status: 'not_contacted',
              contactedOn: '',
              followUpOn: '',
              notes: '',
            }
          }
          totalCount={filteredConsultancies.length}
          onClose={() => setSelectedConsultancy(null)}
          onUpdateRecord={handleUpdateRecord}
          onNavigate={handleNavigateDetail}
          hasPrev={selectedIndex > 0}
          hasNext={selectedIndex < filteredConsultancies.length - 1}
          onToast={addToast}
        />
      )}

      {/* Reset Confirmation Modal */}
      {showResetDialog && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset All Outreach Records?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              This will uncheck all completed consultancies and clear your outreach statuses, call dates, and notes. This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowResetDialog(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetAll}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-xs"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
