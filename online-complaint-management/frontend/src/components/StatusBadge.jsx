const STATUS_STYLES = {
  Pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  'In Progress': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Resolved: 'bg-green-50 text-green-700 ring-green-600/20',
  Rejected: 'bg-red-50 text-red-700 ring-red-600/20',
};

const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  Medium: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  High: 'bg-red-50 text-red-700 ring-red-600/20',
};

const base = 'inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset';

export function StatusBadge({ status }) {
  return <span className={`${base} ${STATUS_STYLES[status] || STATUS_STYLES.Pending}`}>{status}</span>;
}

export function PriorityBadge({ priority }) {
  return <span className={`${base} ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}`}>{priority}</span>;
}
