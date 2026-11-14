import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ClipboardList, Clock, Loader, Mail, PlusCircle, Calendar, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import StatCard from '../../components/StatCard';
import UserComplaintsTable from '../../components/UserComplaintsTable';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    api
      .get('/complaints/stats')
      .then((res) => setStats(res.data.stats))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [refreshKey]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Hello, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-slate-500">Here is an overview of your complaints.</p>
        </div>
        <Link to="/complaints/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          Submit Complaint
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={ClipboardList} label="Total complaints" value={stats?.total} color="blue" loading={!stats} />
        <StatCard icon={Clock} label="Pending" value={stats?.pending} color="amber" loading={!stats} />
        <StatCard icon={Loader} label="In progress" value={stats?.inProgress} color="slate" loading={!stats} />
        <StatCard icon={CheckCircle2} label="Resolved" value={stats?.resolved} color="green" loading={!stats} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <UserComplaintsTable
            title="Recent complaints"
            limit={5}
            compact
            onChanged={() => setRefreshKey((k) => k + 1)}
          />
        </div>

        {/* Profile section */}
        <div className="card h-fit p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-xl font-semibold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm capitalize text-slate-500">{user.role === 'user' ? 'Student' : user.role}</p>
            </div>
          </div>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-slate-400" />
              <dd className="truncate text-slate-700">{user.email}</dd>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <dd className="text-slate-700">Member since {formatDate(user.createdAt)}</dd>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <dd className="text-slate-700">Rejected complaints: {stats?.rejected ?? '-'}</dd>
            </div>
          </dl>

          <Link to="/profile" className="btn-secondary mt-6 w-full">View profile</Link>
        </div>
      </div>
    </div>
  );
}
