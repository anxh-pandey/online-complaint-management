import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api, { getErrorMessage } from '../../api/axios';
import ComplaintInfo from '../../components/ComplaintInfo';
import ConfirmModal from '../../components/ConfirmModal';
import { PageLoader } from '../../components/Spinner';

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api
      .get(`/complaints/${id}`)
      .then((res) => setComplaint(res.data.complaint))
      .catch((err) => {
        toast.error(getErrorMessage(err));
        navigate('/complaints', { replace: true });
      });
  }, [id, navigate]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint deleted');
      navigate('/complaints', { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  if (!complaint) return <PageLoader />;

  const isPending = complaint.status === 'Pending';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/complaints" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to my complaints
        </Link>

        {isPending && (
          <div className="flex gap-2">
            <Link to={`/complaints/${id}/edit`} className="btn-secondary">
              <Pencil className="h-4 w-4" /> Edit
            </Link>
            <button className="btn-danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          </div>
        )}
      </div>

      <ComplaintInfo complaint={complaint} />

      {!isPending && (
        <p className="text-center text-xs text-slate-400">
          This complaint is {complaint.status.toLowerCase()}, so it can no longer be edited or deleted.
        </p>
      )}

      <ConfirmModal
        open={confirmOpen}
        message="Delete this complaint? This cannot be undone."
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
