import { Link } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import UserComplaintsTable from '../../components/UserComplaintsTable';

export default function MyComplaints() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Complaints</h1>
          <p className="text-sm text-slate-500">Search, filter and track everything you have submitted.</p>
        </div>
        <Link to="/complaints/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" />
          Submit Complaint
        </Link>
      </div>

      <UserComplaintsTable title="All complaints" />
    </div>
  );
}
