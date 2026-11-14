import { useEffect, useState } from 'react';
import { Calendar, Mail, ShieldCheck, User } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/complaints/stats').then((res) => setStats(res.data.stats)).catch(() => {});
  }, []);

  const rows = [
    { icon: User, label: 'Full name', value: user.name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: ShieldCheck, label: 'Account type', value: user.role === 'user' ? 'Student' : user.role },
    { icon: Calendar, label: 'Member since', value: formatDate(user.createdAt) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">My Profile</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-semibold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-900">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>

        <dl className="grid gap-5 pt-6 sm:grid-cols-2">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon className="mt-0.5 h-4 w-4 text-slate-400" />
              <div>
                <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
                <dd className="text-sm text-slate-800">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </div>

      <div className="card p-6">
        <h2 className="text-base font-semibold text-slate-900">Complaint summary</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {[
            ['Total', stats?.total],
            ['Pending', stats?.pending],
            ['In progress', stats?.inProgress],
            ['Resolved', stats?.resolved],
            ['Rejected', stats?.rejected],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xl font-semibold text-slate-900">{value ?? '-'}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
