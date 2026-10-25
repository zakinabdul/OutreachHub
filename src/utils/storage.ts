import { INITIAL_CONSULTANCIES, OutreachRecord } from '../data/consultancies';

const STORAGE_KEY = 'kerala_outreach_data_v1';

export function getStoredOutreachRecords(): Record<number, OutreachRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to read outreach records from localStorage', e);
  }

  // Initial defaults
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
  return initial;
}

export function saveOutreachRecords(records: Record<number, OutreachRecord>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save outreach records to localStorage', e);
  }
}

export function exportOutreachToCSV(records: Record<number, OutreachRecord>): void {
  const headers = [
    '#',
    'Priority',
    'Consultancy',
    'Town',
    'District',
    'Phone',
    'Google Rating',
    'Reviews',
    'Tick Mark Completed',
    'Outreach Status',
    'Contacted On',
    'Follow-up On',
    'My Notes',
    'Why This Priority',
    'Working Hours',
    'Address',
    'Website',
  ];

  const rows = INITIAL_CONSULTANCIES.map((c) => {
    const rec = records[c.id] || {
      completed: false,
      status: 'not_contacted',
      contactedOn: '',
      followUpOn: '',
      notes: '',
    };
    return [
      c.id,
      c.priority,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.town.replace(/"/g, '""')}"`,
      c.district,
      `"${c.phone}"`,
      c.rating,
      c.reviews,
      rec.completed ? 'YES' : 'NO',
      `"${rec.status}"`,
      `"${rec.contactedOn}"`,
      `"${rec.followUpOn}"`,
      `"${(rec.notes || '').replace(/"/g, '""')}"`,
      `"${c.whyPriority.replace(/"/g, '""')}"`,
      `"${c.workingHours.replace(/"/g, '""')}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      `"${c.website}"`,
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `kerala_study_abroad_outreach_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
