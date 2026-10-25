import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Phone,
  PhoneCall,
  Copy,
  Check,
  MapPin,
  Clock,
  Globe,
  Star,
  ExternalLink,
  MessageCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Info,
  Building2,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { Consultancy, OutreachRecord } from '../data/consultancies';
import { extractCallablePhone, isMobileForWhatsApp, copyPhoneNumber } from '../utils/phone';

interface ConsultancyDetailModalProps {
  consultancy: Consultancy;
  record: OutreachRecord;
  totalCount: number;
  onClose: () => void;
  onUpdateRecord: (id: number, updates: Partial<OutreachRecord>) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasPrev: boolean;
  hasNext: boolean;
  onToast: (text: string, type?: 'success' | 'info' | 'copy') => void;
}

const QUICK_NOTES = [
  'Spoke to counsellor, follow-up needed',
  'Decision maker not available, call back tomorrow',
  'Left message / Ringing without answer',
  'Interested, sent brochure via WhatsApp',
  'Requested proposal email',
  'Not interested at this time',
];

export const ConsultancyDetailModal: React.FC<ConsultancyDetailModalProps> = ({
  consultancy,
  record,
  totalCount,
  onClose,
  onUpdateRecord,
  onNavigate,
  hasPrev,
  hasNext,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [localNotes, setLocalNotes] = useState(record.notes || '');

  // Keep local notes synchronized when consultancy changes
  useEffect(() => {
    setLocalNotes(record.notes || '');
  }, [consultancy.id, record.notes]);

  const callablePhone = extractCallablePhone(consultancy.phone);
  const whatsappNumber = isMobileForWhatsApp(consultancy.phone);
  const isDone = record.completed;

  const handleCopy = async () => {
    if (!consultancy.phone || consultancy.phone.toLowerCase().includes('not listed')) {
      onToast('No phone number listed', 'info');
      return;
    }
    const success = await copyPhoneNumber(consultancy.phone);
    if (success) {
      setCopied(true);
      onToast(`Copied ${consultancy.phone} to clipboard`, 'copy');
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleCall = () => {
    if (callablePhone) {
      // Mark as called/contacted if currently not contacted
      if (record.status === 'not_contacted') {
        const today = new Date().toISOString().split('T')[0];
        onUpdateRecord(consultancy.id, {
          status: 'called',
          completed: true,
          contactedOn: record.contactedOn || today,
        });
      }
      window.location.href = `tel:${callablePhone}`;
    } else {
      onToast('Phone number is not listed on Google Maps', 'info');
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalNotes(val);
    onUpdateRecord(consultancy.id, { notes: val });
  };

  const handleAddQuickNote = (phrase: string) => {
    const updated = localNotes ? `${localNotes}\n• ${phrase}` : `• ${phrase}`;
    setLocalNotes(updated);
    onUpdateRecord(consultancy.id, { notes: updated });
    onToast('Note added', 'success');
  };

  const handleToggleComplete = () => {
    const newStatus = !isDone;
    const today = new Date().toISOString().split('T')[0];
    onUpdateRecord(consultancy.id, {
      completed: newStatus,
      contactedOn: newStatus && !record.contactedOn ? today : record.contactedOn,
    });
    onToast(newStatus ? 'Marked as Contacted' : 'Marked as Pending', 'success');
  };

  const priorityColor =
    consultancy.priority === 'High'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : consultancy.priority === 'Medium'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl min-h-screen sm:min-h-0 sm:my-8 bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Sticky Mobile Navigation Top Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] -ml-2 px-3 py-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 active:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
            <span className="font-semibold">Back to List</span>
          </button>

          {/* Stepper controls (#4 of 20) */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono text-slate-500 tabular-nums px-2">
              #{consultancy.priorityOrder} of {totalCount}
            </span>
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => onNavigate('prev')}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Previous consultancy"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => onNavigate('next')}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              aria-label="Next consultancy"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 p-5 sm:p-7 space-y-6 pb-28">
          {/* Main Title & Priority Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border tracking-tight ${priorityColor}`}>
                {consultancy.priority} Priority · Rank #{consultancy.priorityOrder}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {consultancy.town}, {consultancy.district}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
              {consultancy.name}
            </h1>

            <p className="text-sm text-slate-600 mt-1 font-medium">
              {consultancy.category}
            </p>
          </div>

          {/* CRITICAL: Primary Call & Copy Action Box (Mobile Touch Zone) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-900">
                Contact & Quick Outreach
              </span>
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                Verified Listing
              </span>
            </div>

            {callablePhone ? (
              <div className="space-y-2.5">
                {/* Number Display with Copy Action */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                        Phone Number
                      </div>
                      <div className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                        {consultancy.phone}
                      </div>
                    </div>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="min-h-[44px] min-w-[44px] px-3.5 py-2 flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Primary Touch Actions: Big Click-to-Call + WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {/* Immediate Direct Call CTA */}
                  <a
                    href={`tel:${callablePhone}`}
                    onClick={handleCall}
                    className="min-h-[50px] flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-base shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all text-center"
                  >
                    <PhoneCall className="w-5 h-5 stroke-[2.5]" />
                    <span>Call Immediately</span>
                  </a>

                  {/* WhatsApp Action (if available) */}
                  {whatsappNumber ? (
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                        `Hello, contacting regarding study abroad admissions and collaboration.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[50px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] active:bg-[#1caa52] text-white font-semibold text-sm shadow-md shadow-emerald-500/10 active:scale-[0.98] transition-all text-center"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" />
                      <span>WhatsApp Message</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="min-h-[50px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm active:scale-[0.98] transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy Number</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-sm space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Phone not listed directly on Google Maps</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  {consultancy.phone}
                </p>
                {consultancy.website && (
                  <a
                    href={consultancy.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-medium text-xs hover:bg-amber-700 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Visit Website for Contact Info</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Strategic Insight: "Why this priority" from the Excel Sheet */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Outreach Strategy & Rationale</span>
            </div>
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              "{consultancy.whyPriority}"
            </p>
          </div>

          {/* Location, Google Rating, Working Hours, Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Google Rating */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Google Rating & Reviews
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-lg font-bold text-slate-900">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span className="tabular-nums font-mono">{consultancy.rating.toFixed(1)}</span>
                </div>
                <span className="text-xs text-slate-500 tabular-nums">
                  ({consultancy.reviews.toLocaleString()} reviews)
                </span>
              </div>
            </div>

            {/* Working Hours */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Working Hours</span>
              </div>
              <div className="text-xs font-medium text-slate-800 leading-snug">
                {consultancy.workingHours}
              </div>
            </div>

            {/* Address & Google Maps */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Physical Address</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    consultancy.googleMapsQuery || `${consultancy.name} ${consultancy.address}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="text-xs text-slate-700 font-medium leading-relaxed">
                {consultancy.address}
              </div>
            </div>

            {/* Official Website */}
            {consultancy.website ? (
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1 sm:col-span-2 flex items-center justify-between">
                <div className="min-w-0 pr-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                    <span>Website</span>
                  </div>
                  <a
                    href={consultancy.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-medium text-emerald-700 hover:underline truncate block mt-0.5"
                  >
                    {consultancy.website}
                  </a>
                </div>
                <a
                  href={consultancy.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 flex items-center gap-1 shrink-0"
                >
                  <span>Visit</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : null}
          </div>

          {/* Interactive Outreach Log & CRM Notes */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Outreach Log & CRM Notes</span>
              </h2>

              {/* Tick mark toggle inside detail view */}
              <button
                type="button"
                onClick={handleToggleComplete}
                className={`min-h-[44px] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors border ${
                  isDone
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Check className={`w-4 h-4 ${isDone ? 'stroke-[3]' : 'text-slate-400'}`} />
                <span>{isDone ? 'Marked Contacted' : 'Mark as Contacted'}</span>
              </button>
            </div>

            {/* Status Selector */}
            <div className="space-y-1.5">
              <label htmlFor="outreach-status-select" className="text-xs font-semibold text-slate-600">
                Outreach Status
              </label>
              <select
                id="outreach-status-select"
                value={record.status}
                onChange={(e) => {
                  const val = e.target.value as OutreachRecord['status'];
                  const isFinished = val !== 'not_contacted';
                  onUpdateRecord(consultancy.id, {
                    status: val,
                    completed: isFinished,
                  });
                }}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="not_contacted">Not Contacted</option>
                <option value="called">Called / Left Voicemail</option>
                <option value="follow_up">Follow-up Scheduled</option>
                <option value="meeting">Meeting / Demo Fixed</option>
                <option value="interested">Interested Lead</option>
                <option value="not_interested">Not Interested / Dropped</option>
              </select>
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="contacted-date-input" className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Contacted On</span>
                </label>
                <input
                  id="contacted-date-input"
                  type="date"
                  value={record.contactedOn || ''}
                  onChange={(e) => onUpdateRecord(consultancy.id, { contactedOn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="followup-date-input" className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Next Follow-up</span>
                </label>
                <input
                  id="followup-date-input"
                  type="date"
                  value={record.followUpOn || ''}
                  onChange={(e) => onUpdateRecord(consultancy.id, { followUpOn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono text-slate-700"
                />
              </div>
            </div>

            {/* Quick Note Chips */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Quick Notes Tap-to-Add
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_NOTES.map((qn) => (
                  <button
                    key={qn}
                    type="button"
                    onClick={() => handleAddQuickNote(qn)}
                    className="text-xs px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 transition-colors"
                  >
                    + {qn}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Textarea */}
            <div className="space-y-1">
              <label htmlFor="crm-notes-textarea" className="text-xs font-semibold text-slate-600">
                Notes & Discussion Records
              </label>
              <textarea
                id="crm-notes-textarea"
                rows={3}
                value={localNotes}
                onChange={handleNotesChange}
                placeholder="Log call conversation details, decision maker name, next steps..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              />
              <span className="text-[11px] text-slate-400 block">
                Changes are automatically saved to your browser.
              </span>
            </div>
          </div>
        </div>

        {/* Floating Mobile Bottom Action Bar */}
        <div className="fixed sm:absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center gap-2 z-30">
          {callablePhone ? (
            <a
              href={`tel:${callablePhone}`}
              onClick={handleCall}
              className="flex-1 min-h-[48px] flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
            >
              <PhoneCall className="w-4 h-4 stroke-[2.5]" />
              <span>Call ({consultancy.phone})</span>
            </a>
          ) : (
            <div className="flex-1 text-center py-2 text-xs text-slate-500">
              Phone not available on Google
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[48px] px-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-medium text-xs transition-colors shrink-0"
            title="Copy phone"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span className="hidden xs:inline">Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
