import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/axios';
import ComplaintForm from '../../components/ComplaintForm';

export default function NewComplaint() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await api.post('/complaints', formData);
      toast.success('Complaint submitted successfully');
      navigate(`/complaints/${data.complaint._id}`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Submit a Complaint</h1>
        <p className="text-sm text-slate-500">Provide as much detail as you can so the issue can be resolved quickly.</p>
      </div>

      <ComplaintForm submitting={submitting} onSubmit={handleSubmit} onCancel={() => navigate(-1)} />
    </div>
  );
}
