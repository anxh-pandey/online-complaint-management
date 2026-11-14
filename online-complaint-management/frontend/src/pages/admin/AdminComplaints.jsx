import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/axios';
import { CATEGORIES, STATUSES } from '../../utils/constants';
import { formatDate, useDebounce } from '../../utils/helpers';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { PageLoader } from '../../components/Spinner';
import ConfirmModal from '../../components/ConfirmModal';
import Pagination from '../../components/Pagination';

export default function AdminComplaints() {
  const [result, setResult] = useState({ complaints: [], total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  // Go back to page 1 whenever a filter changes
  useEffect(() => setPage(1), [debouncedSearch, status, category]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (status) params.status = status;
      if (category) params.category = category;
      const { data } = await api.get('/admin/complaints', { params });
      setResult(data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, category]);

  useEffect(() => {
    load();
  }, [load]);

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/complaints/${toDelete._id}`);
      toast.success('Complaint deleted');
      setToDelete(null);
      // If the last row of a page was removed, step back one page
      if (result.complaints.length === 1 && page > 1) setPage(page - 1);
      else await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const hasFilters = search || status || category;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">All Complaints</h1>
        <p className="text-sm text-slate-500">Review, update and manage complaints from every student.</p>
      </div>

      <div className="card">
        <div className="flex flex-col gap-2 border-b border-slate-200 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by complaint title or user name / email"
              className="input pl-9"
            />
          </div>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="input md:w-44">
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="input md:w-40">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <PageLoader text="Loading complaints..." />
        ) : result.complaints.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <FileText className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              {hasFilters ? 'No complaints match your filters' : 'No complaints have been submitted yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Complaint</th>
                  <th className="th hidden md:table-cell">Submitted by</th>
                  <th className="th hidden lg:table-cell">Category</th>
                  <th className="th hidden xl:table-cell">Priority</th>
                  <th className="th">Status</th>
                  <th className="th hidden sm:table-cell">Date</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/60">
                    <td className="td max-w-[14rem]">
                      <Link to={`/admin/complaints/${c._id}`} className="block truncate font-medium text-slate-900 hover:text-blue-600">
                        {c.title}
                      </Link>
                      <span className="block truncate text-xs text-slate-500">{c.location}</span>
                    </td>
                    <td className="td hidden md:table-cell">
                      <span className="block">{c.user?.name || 'Deleted user'}</span>
                      <span className="block text-xs text-slate-500">{c.user?.email}</span>
                    </td>
                    <td className="td hidden lg:table-cell">{c.category}</td>
                    <td className="td hidden xl:table-cell"><PriorityBadge priority={c.priority} /></td>
                    <td className="td"><StatusBadge status={c.status} /></td>
                    <td className="td hidden whitespace-nowrap sm:table-cell">{formatDate(c.createdAt)}</td>
                    <td className="td">
                      <div className="flex justify-end gap-1">
                        <Link to={`/admin/complaints/${c._id}`} className="icon-btn" title="View / update">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button className="icon-btn hover:!text-red-600" title="Delete" onClick={() => setToDelete(c)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={result.page} pages={result.pages} total={result.total} onChange={setPage} />
      </div>

      <ConfirmModal
        open={!!toDelete}
        title="Delete complaint?"
        message={`"${toDelete?.title}" will be permanently removed. This cannot be undone.`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
