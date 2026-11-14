import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Pencil, Search, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../api/axios';
import { CATEGORIES, STATUSES } from '../utils/constants';
import { formatDate, useDebounce } from '../utils/helpers';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { PageLoader } from './Spinner';
import ConfirmModal from './ConfirmModal';

// The student's complaints with search + filters.
// limit  -> show only the latest N rows (dashboard)
// compact -> hide category / priority columns (narrow dashboard card)
export default function UserComplaintsTable({ title, limit, compact = false, onChanged }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (status) params.status = status;
      if (category) params.category = category;
      const { data } = await api.get('/complaints', { params });
      setComplaints(data.complaints);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, category]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/complaints/${toDelete._id}`);
      toast.success('Complaint deleted');
      setToDelete(null);
      await load();
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const rows = limit ? complaints.slice(0, limit) : complaints;
  const hasFilters = search || status || category;

  return (
    <div className="card">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title"
              className="input pl-9 sm:w-52"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-36">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input sm:w-40">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader text="Loading complaints..." />
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center py-14 text-center">
          <FileText className="h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">
            {hasFilters ? 'No complaints match your filters' : 'You have not submitted any complaints yet'}
          </p>
          {!hasFilters && (
            <Link to="/complaints/new" className="btn-primary mt-4">Submit your first complaint</Link>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="th">Complaint</th>
                {!compact && <th className="th hidden md:table-cell">Category</th>}
                {!compact && <th className="th hidden lg:table-cell">Priority</th>}
                <th className="th">Status</th>
                <th className="th hidden sm:table-cell">Date</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50/60">
                  <td className="td max-w-[14rem]">
                    <Link to={`/complaints/${c._id}`} className="block truncate font-medium text-slate-900 hover:text-blue-600">
                      {c.title}
                    </Link>
                    <span className="block truncate text-xs text-slate-500">{c.location}</span>
                  </td>
                  {!compact && <td className="td hidden md:table-cell">{c.category}</td>}
                  {!compact && (
                    <td className="td hidden lg:table-cell"><PriorityBadge priority={c.priority} /></td>
                  )}
                  <td className="td"><StatusBadge status={c.status} /></td>
                  <td className="td hidden whitespace-nowrap sm:table-cell">{formatDate(c.createdAt)}</td>
                  <td className="td">
                    <div className="flex justify-end gap-1">
                      <Link to={`/complaints/${c._id}`} className="icon-btn" title="View details">
                        <Eye className="h-4 w-4" />
                      </Link>
                      {c.status === 'Pending' && (
                        <>
                          <Link to={`/complaints/${c._id}/edit`} className="icon-btn" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </Link>
                          <button className="icon-btn hover:!text-red-600" title="Delete" onClick={() => setToDelete(c)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {limit && complaints.length > limit && (
        <div className="border-t border-slate-200 px-4 py-3 text-right">
          <Link to="/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all {complaints.length} complaints &rarr;
          </Link>
        </div>
      )}

      <ConfirmModal
        open={!!toDelete}
        message={`Delete "${toDelete?.title}"? This cannot be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
