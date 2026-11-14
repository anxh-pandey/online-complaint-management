import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/axios';
import ComplaintForm from '../../components/ComplaintForm';
import { PageLoader } from '../../components/Spinner';

export default function EditComplaint() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get(`/complaints/${id}`)
      .then((res) => {
        if (res.data.complaint.status !== 'Pending') {
          toast.error('Only pending complaints can be edited');
          navigate(`/complaints/${id}`, { replace: true });
        } else {
          setComplaint(res.data.complaint);
        }
      })
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/complaints', { replace: true });
      });
  }, [id, navigate]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await api.put(`/complaints/${id}`, formData);
      toast.success('Complaint updated');
      navigate(`/complaints/${id}`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (!complaint) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to={`/complaints/${id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Edit Complaint</h1>
      </div>

      <ComplaintForm
        initial={complaint}
        submitting={submitting}
        submitLabel="Save Changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/complaints/${id}`)}
      />
    </div>
  );
}
