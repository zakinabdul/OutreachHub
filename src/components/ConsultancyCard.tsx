import React, { useState } from 'react';
import { Phone, Copy, Check, Star, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Consultancy, OutreachRecord } from '../data/consultancies';
import { extractCallablePhone, copyPhoneNumber } from '../utils/phone';

interface ConsultancyCardProps {
  consultancy: Consultancy;
  record: OutreachRecord;
  onToggleComplete: (id: number) => void;
  onSelect: (consultancy: Consultancy) => void;
  onToast: (text: string, type?: 'success' | 'info' | 'copy') => void;
}

export const ConsultancyCard: React.FC<ConsultancyCardProps> = ({
  consultancy,
  record,
  onToggleComplete,
  onSelect,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const callablePhone = extractCallablePhone(consultancy.phone);
  const isDone = record.completed;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!consultancy.phone || consultancy.phone.toLowerCase().includes('not listed')) {
      onToast('No phone number listed for this consultancy', 'info');
      return;
    }
    const success = await copyPhoneNumber(consultancy.phone);
    if (success) {
      setCopied(true);
      onToast(`Copied ${consultancy.phone}`, 'copy');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (callablePhone) {
      window.location.href = `tel:${callablePhone}`;
    } else {
      onToast('Phone number not listed on Google', 'info');
    }
  };

  const handleTick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(consultancy.id);
    onToast(
      !isDone ? `Marked #${consultancy.priorityOrder} as contacted` : `Unmarked #${consultancy.priorityOrder}`,
      'success'
    );
  };

  // Priority styling
  const priorityTheme =
    consultancy.priority === 'High'
      ? {
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
          dot: 'bg-emerald-600',
          border: 'border-slate-200/80 hover:border-emerald-300',
        }
      : consultancy.priority === 'Medium'
      ? {
          badge: 'bg-amber-50 text-amber-800 border-amber-200/80',
          dot: 'bg-amber-600',
          border: 'border-slate-200/80 hover:border-amber-300',
        }
      : {
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-500',
          border: 'border-slate-200/80 hover:border-slate-300',
        };

  return (
    <div
      onClick={() => onSelect(consultancy)}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl bg-white border transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.99] select-none ${
        priorityTheme.border
      } ${isDone ? 'bg-slate-50/70 border-emerald-200/60' : ''}`}
    >
      {/* Top Header: Rank, Priority Tag, and Tick Mark */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          {/* Priority Order Number */}
          <span className="font-mono text-xs font-semibold text-slate-500 tabular-nums">
            #{consultancy.priorityOrder}
          </span>
          {/* Priority indicator tag */}
          <span
            className={`text-[11px] font-medium px-2 py-0.5 rounded-md border tracking-tight ${priorityTheme.badge}`}
          >
            {consultancy.priority} Priority
          </span>
          {/* Category subtitle */}
          <span className="hidden sm:inline text-xs text-slate-400 truncate max-w-[140px]">
            {consultancy.category}
          </span>
        </div>

        {/* Tick Mark Checkbox Button - Min 44x44px Touch Target */}
        <button
          type="button"
          aria-label={isDone ? 'Mark as pending' : 'Mark as contacted'}
          onClick={handleTick}
          className="min-w-[44px] min-h-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors"
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isDone
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs scale-105'
                : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </button>
      </div>

      {/* Main Content: Consultancy Title */}
      <div className="mb-2">
        <h3
          className={`text-base font-semibold text-slate-900 tracking-tight leading-snug line-clamp-2 ${
            isDone ? 'text-slate-700' : ''
          }`}
        >
          {consultancy.name}
        </h3>
        {/* Unboxed Metadata Line */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 mt-1">
          <span className="font-medium text-slate-700">{consultancy.town}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{consultancy.district}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-0.5 font-medium text-slate-700">
            <Star className="w-3 h-3 fill-amber-400 text-amber-500 inline -mt-0.5" />
            <span className="tabular-nums">{consultancy.rating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({consultancy.reviews.toLocaleString()})</span>
          </span>
        </div>
      </div>

      {/* Footer Strip: Quick Call & Copy Phone Controls */}
      <div className="pt-2.5 mt-1 border-t border-slate-100 flex items-center justify-between gap-2">
        {callablePhone ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {/* Quick Call Button (High-visibility for immediate action) */}
            <button
              type="button"
              onClick={handleCall}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 rounded-lg transition-colors border border-emerald-200/60 shrink-0"
              title="Call immediately"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </button>

            {/* Quick Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
              title="Copy phone number"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Phone display string truncated */}
            <span className="text-[11px] font-mono text-slate-500 truncate hidden xs:inline tabular-nums ml-1">
              {consultancy.phone}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-slate-400 italic">
            <span>Phone not listed on Google</span>
          </div>
        )}

        {/* Card tap indicator */}
        <div className="flex items-center text-xs font-medium text-slate-400 group-hover:text-slate-900 transition-colors pl-2 shrink-0">
          <span className="hidden sm:inline mr-1 text-[11px]">Details</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Done banner status if marked */}
      {isDone && (
        <div className="absolute top-2 right-12 flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md pointer-events-none">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Contacted</span>
        </div>
      )}
    </div>
  );
};
