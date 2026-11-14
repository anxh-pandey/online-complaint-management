import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/axios';
import { CATEGORIES } from '../../utils/constants';
import { formatDate } from '../../utils/helpers';
import StatCard from '../../components/StatCard';
import { StatusBadge } from '../../components/StatusBadge';
import { PageLoader } from '../../components/Spinner';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setData(res.data))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, []);

  if (!data) return <PageLoader text="Loading dashboard..." />;

  const { stats, byCategory, recentComplaints } = data;
  const maxCategory = Math.max(1, ...CATEGORIES.map((c) => byCategory[c] || 0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of users and complaints across the system.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Registered users" value={stats.totalUsers} color="blue" />
        <StatCard icon={ClipboardList} label="Total complaints" value={stats.totalComplaints} color="slate" />
        <StatCard icon={Clock} label="Pending" value={stats.pending} color="amber" />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats.resolved} color="green" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent complaints */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 p-4">
            <h2 className="text-base font-semibold text-slate-900">Recent complaints</h2>
            <Link to="/admin/complaints" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </div>

          {recentComplaints.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No complaints have been submitted yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentComplaints.map((c) => (
                <li key={c._id}>
                  <Link
                    to={`/admin/complaints/${c._id}`}
                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{c.title}</p>
                      <p className="truncate text-xs text-slate-500">
                        {c.user?.name || 'Deleted user'} &middot; {c.category} &middot; {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card h-fit p-5">
          <h2 className="text-base font-semibold text-slate-900">Complaints by category</h2>
          <ul className="mt-4 space-y-4">
            {CATEGORIES.map((c) => {
              const count = byCategory[c] || 0;
              return (
                <li key={c}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-slate-700">{c}</span>
                    <span className="font-medium text-slate-900">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-blue-600" style={{ width: `${(count / maxCategory) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-sm text-slate-600">
            <span>In progress: <b className="text-slate-900">{stats.inProgress}</b></span>
            <span>Rejected: <b className="text-slate-900">{stats.rejected}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}
