import { Calendar, Clock, Flag, MapPin, Tag, User } from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { imageUrl } from '../api/axios';
import { formatDateTime } from '../utils/helpers';

function Detail({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <div className="text-sm text-slate-800">{children}</div>
      </div>
    </div>
  );
}

// Read-only view of a complaint, shared by the student and admin detail pages
export default function ComplaintInfo({ complaint, showUser = false }) {
  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">{complaint.title}</h2>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{complaint.description}</p>

      <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
        {showUser && complaint.user && (
          <Detail icon={User} label="Submitted by">
            {complaint.user.name}
            <span className="block text-xs text-slate-500">{complaint.user.email}</span>
          </Detail>
        )}
        <Detail icon={Tag} label="Category">{complaint.category}</Detail>
        <Detail icon={MapPin} label="Location">{complaint.location}</Detail>
        <Detail icon={Flag} label="Priority"><PriorityBadge priority={complaint.priority} /></Detail>
        <Detail icon={Calendar} label="Submitted on">{formatDateTime(complaint.createdAt)}</Detail>
        <Detail icon={Clock} label="Last updated">{formatDateTime(complaint.updatedAt)}</Detail>
      </div>

      {complaint.image && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Attachment</p>
          <a href={imageUrl(complaint.image)} target="_blank" rel="noreferrer">
            <img
              src={imageUrl(complaint.image)}
              alt="Complaint attachment"
              className="max-h-72 rounded-lg border border-slate-200"
            />
          </a>
        </div>
      )}

      <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Admin remarks</p>
        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
          {complaint.adminRemarks || 'No remarks yet.'}
        </p>
      </div>
    </div>
  );
}
